import { BACKEND_URL } from "@/app/config";
import { Shape } from "@/types";
import axios from "axios";
import { nanoid } from "nanoid";
import { drawCircle, drawLine, drawPencil, drawRectangle, drawResizeHandlers, drawSelectionBox , renderShape} from "./shapes";

type InitDrawParams = {
    canvas: HTMLCanvasElement,
    roomId: string,
    socket: WebSocket,
    ctx: CanvasRenderingContext2D,
    selectedShapeType: string,
    shapesRef: React.MutableRefObject<Shape[]>,
    strokeColor: string,
    strokeWidth: number,
    backgroundColor: string,
    redoRef: React.MutableRefObject<Shape[]>
}

export let existingShapesLength = 0;
let selectedShape: null | Shape = null;
let resizingHandle: number | null = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let isDraggingShape = false;
const closeEnough = 10;


export const initDraw = ({ canvas, roomId, socket, ctx, selectedShapeType, shapesRef, strokeColor, strokeWidth, backgroundColor, redoRef }: InitDrawParams) => {

    const handleSocketMessage = (e: MessageEvent) => {
        const data = JSON.parse(e.data);
        if (data.type === "shape" && data.payload.roomId === roomId) {
            const shapeIndex = shapesRef.current.findIndex(
                (s) => s.tempId === data.payload.tempId
            );

            
            if (shapeIndex !== -1) {
                shapesRef.current[shapeIndex] = {
                    ...shapesRef.current[shapeIndex],
                    id: data.payload.shapeId,
                    
                };
            } else {
                shapesRef.current.push({
                    id: data.payload.id,
                    type: data.payload.type,
                    data: data.payload.data,
                    strokeColor: data.payload.strokeColor,
                    strokeWidth: data.payload.strokeWidth,
                    backgroundColor: data.payload.backgroundColor,
                    tempId: data.payload.tempId,
                });
            }

            clearCanvas(shapesRef.current, ctx, canvas);
        }

        if (data.type === "undo" && data.payload.roomId === roomId) {
            const shapeIndex = shapesRef.current.findIndex((s) => s.id === data.payload.shapeId);
            if (shapeIndex !== -1) {
                redoRef.current.push(shapesRef.current[shapeIndex]);
                shapesRef.current.splice(shapeIndex, 1);
                clearCanvas(shapesRef.current, ctx, canvas);
            }
        }

        if (data.type === "redo" && data.payload.roomId === roomId) {
            shapesRef.current.push({
                id: data.payload.id,
                type: data.payload.type,
                data: data.payload.data,
                strokeColor: data.payload.strokeColor,
                strokeWidth: data.payload.strokeWidth,
                backgroundColor: data.payload.backgroundColor,
                tempId: data.payload.tempId,
            });

            clearCanvas(shapesRef.current, ctx, canvas);
        }
    };

    socket.onmessage = handleSocketMessage;

    getExistingShapes(roomId, shapesRef).then(() => {
        existingShapesLength = shapesRef.current.length;
        clearCanvas(shapesRef.current, ctx, canvas);
    });    
    
    clearCanvas(shapesRef.current, ctx, canvas);

    let clicked = false;
    let startX = 0;
    let startY = 0;
    const pencilPath: { x: number, y: number }[] = [];

    const handleMouseDown = (e: MouseEvent) => {
        clicked = true;
        startX = e.clientX;
        startY = e.clientY;

        if (selectedShapeType === "pencil") {
            pencilPath.length = 0;
            pencilPath.push({ x: startX, y: startY });
        }

        if (selectedShapeType === "select") {

            if (selectedShape) {
                const data = JSON.parse(selectedShape.data);
                const handle = getHandleUnderCursor(selectedShape.type, data, startX, startY);
                
                if (handle || handle === 0) {   
                    resizingHandle = handle;
                    return;
                }
            }


            const shape = shapesRef.current.find((shape) => {
                const data = JSON.parse(shape.data);

                if (shape.type === "rect") {
                    const left = Math.min(data.x, data.x + data.width);
                    const right = Math.max(data.x, data.x + data.width);
                    const top = Math.min(data.y, data.y + data.height);
                    const bottom = Math.max(data.y, data.y + data.height);

                    return (
                        startX >= left &&
                        startX <= right &&
                        startY >= top &&
                        startY <= bottom
                    );
                }

                if (shape.type === "circle") {
                    const dist = Math.sqrt(
                        (startX - data.centerX) ** 2 +
                        (startY - data.centerY) ** 2
                    );
                    return dist <= data.radius;
                }

                if (shape.type === "line") {
                    // Allow some tolerance
                    const tolerance = 5;
                    const { startX: x1, startY: y1, endX: x2, endY: y2 } = data;
                    const distance = Math.abs(
                        ((y2 - y1) * startX -
                            (x2 - x1) * startY +
                            x2 * y1 -
                            y2 * x1) /
                        Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2)
                    );
                    return distance < tolerance;
                }

                return false;
            });

            if (shape) {
                selectedShape = shape;           
                const data = JSON.parse(shape.data);
                if (shape.type === "rect") {
                    drawSelectionBox(ctx, data.x, data.y, data.width, data.height);
                    drawResizeHandlers(ctx, "rect", data);
                }
                if (shape.type === "circle") {
                    drawResizeHandlers(ctx, "circle", data);
                }
                if (shape.type === "line") {
                    drawResizeHandlers(ctx, "line", data);
                }
                dragOffsetX = startX - data.x;
                dragOffsetY = startY - data.y;
                isDraggingShape = true;
            } else {
                selectedShape = null;
            }
        }
    };

    const handleMouseUp = (e: MouseEvent) => {
        if (!clicked) return;
        clicked = false;

        const width = e.clientX - startX;
        const height = e.clientY - startY;

        let shape: Shape | null = null;
        let data: any = null;

        const tempId = nanoid();

        if (selectedShapeType === "rect") {
            data = {
                x: startX, 
                y: startY, 
                width, 
                height
            }
            shape = { type: "rect", data: JSON.stringify(data), strokeColor, strokeWidth, backgroundColor, tempId };
        } else if (selectedShapeType === "circle") {
            data = {
                centerX: startX, 
                centerY: startY, 
                radius: Math.sqrt(width ** 2 + height ** 2)
            }
            shape = { type: "circle",data: JSON.stringify(data), strokeColor, strokeWidth, backgroundColor, tempId };
        } else if (selectedShapeType === "line") {
            data = {
                startX, 
                startY, 
                endX: e.clientX, 
                endY: e.clientY
            }
            shape = { type: "line", data: JSON.stringify(data), strokeColor, strokeWidth, backgroundColor, tempId };
        } else if (selectedShapeType === "pencil") {
            data = pencilPath;
            shape = { type: "pencil", data: JSON.stringify(data), strokeColor, strokeWidth, backgroundColor, tempId };
        } else if (selectedShapeType === "select") {
            resizingHandle = null;
            isDraggingShape = false;

            if (!selectedShape) return;

            socket.send(
                JSON.stringify({
                    type: "update",
                    payload: {
                        id: selectedShape.id,
                        data: selectedShape.data,
                        roomId
                    }
                })
            )
        }

        

        if (!shape) return;
        shapesRef.current.push(shape);
        redoRef.current = [];

        socket.send(
            JSON.stringify({
                type: "shape",
                payload: {
                    tempId,
                    data: JSON.stringify(data),
                    strokeWidth,
                    strokeColor,
                    backgroundColor,
                    type: selectedShapeType,
                    roomId,
                    userId: localStorage.getItem("userId"),
                },
            })
        );
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!clicked) return;

        const width = e.clientX - startX;
        const height = e.clientY - startY;
        clearCanvas(shapesRef.current, ctx, canvas);

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.fillStyle = backgroundColor;

        switch (selectedShapeType) {
            case "rect": 
                drawRectangle(ctx, startX, startY, width, height);
                break;
            case "circle": 
                drawCircle(ctx, startX, startY, Math.sqrt(width ** 2 + height ** 2));
                break;
            case "line": 
                drawLine(ctx, startX, startY, e.clientX, e.clientY);
                break;
            case "pencil":
                pencilPath.push({ x: e.clientX, y: e.clientY });
                drawPencil(ctx, pencilPath);
                break;
            case "select":
                if (selectedShape) {
                    const data = JSON.parse(selectedShape.data);
                    const x = e.clientX;
                    const y = e.clientY;

                    if (resizingHandle !== null) {
                        if (selectedShape.type === "rect") {
                            resizeShape("rect", data, resizingHandle, x, y);
                        } else if (selectedShape.type === "circle") {
                            resizeShape("circle", data, resizingHandle, x, y);
                        } else if (selectedShape.type === "line") {
                            resizeShape("line", data, resizingHandle, x, y);
                        }
                        selectedShape.data = JSON.stringify(data);
                    } else if (isDraggingShape) {
                        if (selectedShape.type === "rect" || selectedShape.type === "circle") {
                            data.x = x - dragOffsetX;
                            data.y = y - dragOffsetY;
                        } else if (selectedShape.type === "line") {
                            const deltaX = x - dragOffsetX - data.startX;
                            const deltaY = y - dragOffsetY - data.startY;
                            data.startX += deltaX;
                            data.startY += deltaY;
                            data.endX += deltaX;
                            data.endY += deltaY;
                        }
                        selectedShape.data = JSON.stringify(data);
                    }

                    clearCanvas(shapesRef.current, ctx, canvas);
                }
        }
    };

    canvas.addEventListener("mousedown", handleMouseDown);

    canvas.addEventListener("mouseup", handleMouseUp);

    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
        socket.removeEventListener("message", handleSocketMessage);
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("mousemove", handleMouseMove);
        selectedShape = null;
        resizingHandle = null;
        isDraggingShape = false;
    }
};

async function getExistingShapes(roomId: string, shapesRef: React.MutableRefObject<Shape[]>) {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/user/get-existing-shapes/${roomId}`);
        const shapes = response.data.shapes;

        shapesRef.current = shapes;
    } catch (error) {
        console.log(error);
        shapesRef.current = [];
    }
}

export function clearCanvas(shapes: Shape[], ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    shapes.map(shape => {
        renderShape(ctx, shape);
    })

    if (selectedShape) {
        const data = JSON.parse(selectedShape.data);

        if (selectedShape.type === "rect") {
            drawSelectionBox(ctx, data.x, data.y, data.width, data.height);
            drawResizeHandlers(ctx, "rect", data);
        } else if (selectedShape.type === "circle") {
            drawResizeHandlers(ctx, "circle", data);
        } else if (selectedShape.type === "line") {
            drawResizeHandlers(ctx, "line", data);
        }
    }
}


function checkCloseEnough(p1: number, p2: number){
  return Math.abs(p1-p2)<closeEnough;
}


export function getHandleUnderCursor(
    type: string,
    data: any,
    mouseX: number,
    mouseY: number
): number | null {
    let handlers: { x: number; y: number }[] = [];

     switch (type) {
        case "rect": {
            const { x, y, width, height } = data;
            handlers = [
                { x, y }, // top-left
                { x: x + width, y }, // top-right
                { x, y: y + height }, // bottom-left
                { x: x + width, y: y + height } // bottom-right
            ];
            break;
        }

        case "circle": {
            const { centerX, centerY, radius } = data;
            handlers = [
                { x: centerX, y: centerY - radius }, // top
                { x: centerX + radius, y: centerY }, // right
                { x: centerX, y: centerY + radius }, // bottom
                { x: centerX - radius, y: centerY }  // left
            ];
            break;
        }

        case "line": {
            const { startX, startY, endX, endY } = data;
            handlers = [
                { x: startX, y: startY }, // start point
                { x: endX, y: endY } // end point
            ];
            break;
        }
    }
    
    return handlers.findIndex(({ x, y }) => checkCloseEnough(mouseX, x) && checkCloseEnough(mouseY, y));
}



export function resizeShape(
    type: string,
    data: any,
    handle: number,
    mouseX: number,
    mouseY: number,
) {

    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;

    if (type === "rect") {
        let { x, y, width, height } = data;
        let oldRight = x + width;
        let oldBottom = y + height;

        switch (handle) {
            case 0: // Top-left
                x = mouseX;
                y = mouseY;
                width = oldRight - mouseX;
                height = oldBottom - mouseY;
                break;
            case 1: // Top-right
                width = Math.abs(x - mouseX);
                height += y - mouseY;
                y = mouseY;
                break;
            case 2: // Bottom-left
                width += x - mouseX;
                height = Math.abs(y - mouseY);
                x = mouseX;
                break;
            case 3: // Bottom-right
                width = Math.abs(x - mouseX);
                height = Math.abs(y - mouseY);
                break;
        }

        if (data.width < 10) data.width = 10;
        if (data.height < 10) data.height = 10;

        // Clamp inside canvas
        x = Math.max(0, Math.min(x, canvasWidth - width));
        y = Math.max(0, Math.min(y, canvasHeight - height));

        data.x = x;
        data.y = y;
        data.width = width;
        data.height = height;
    } 
    else if (type === "circle") {
        let { centerX, centerY, radius } = data;
        
        switch (handle) {
            case 0: // Top handle
                radius = Math.abs(mouseY - centerY);
                break;
            case 1: // Right handle
                radius = Math.abs(mouseX - centerX);
                break;
            case 2: // Bottom handle
                radius = Math.abs(mouseY - centerY);
                break;
            case 3: // Left handle
                radius = Math.abs(mouseX - centerX);
                break;
        }

        radius = Math.max(radius, 5); // Enforce minimum radius

        // Clamp circle within canvas bounds
        radius = Math.min(
            radius,
            Math.min(centerX, canvasWidth - centerX, centerY, canvasHeight - centerY)
        );

        data.radius = radius;
    } 
    else if (type === "line") {
        if (handle === 0) { // Resize start point
            data.startX = mouseX;
            data.startY = mouseY;
        } else if (handle === 1) { // Resize end point
            data.endX = mouseX;
            data.endY = mouseY;
        }

        // Clamp line points inside canvas
        data.startX = Math.max(0, Math.min(data.startX, canvasWidth));
        data.startY = Math.max(0, Math.min(data.startY, canvasHeight));
        data.endX = Math.max(0, Math.min(data.endX, canvasWidth));
        data.endY = Math.max(0, Math.min(data.endY, canvasHeight));
    }
}




