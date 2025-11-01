import { BACKEND_URL } from "@/app/config";
import { Shape } from "@/types";
import axios from "axios";
import { nanoid } from "nanoid";
import {
  drawCircle,
  drawLine,
  drawPencil,
  drawRectangle,
  renderShape,
} from "./shapes";
import {
  drawShapeHandlers,
  getHandleUnderCursor as getHandleUnderCursorHelper,
  isPointOnShape,
  resizeShape as resizeShapeHelper,
} from "./shapeHelpers";
import { getCanvasCoordinates, parseShapeData } from "./utils";
import { Point, SocketMessage } from "./types";

type InitDrawParams = {
  canvas: HTMLCanvasElement;
  roomId: string;
  socket: WebSocket;
  ctx: CanvasRenderingContext2D;
  selectedShapeType: string;
  shapesRef: React.MutableRefObject<Shape[]>;
  strokeColor: string;
  strokeWidth: number;
  backgroundColor: string;
  redoRef: React.MutableRefObject<Shape[]>;
  drawingStateRef: React.MutableRefObject<DrawingState | null>;
};

/**
 * Drawing state manager - encapsulates all drawing state
 */
class DrawingState {
  selectedShape: Shape | null = null;
  resizingHandle: number | null = null;
  dragOffset: Point = { x: 0, y: 0 };
  isDraggingShape: boolean = false;
  isDrawing: boolean = false;
  startPoint: Point = { x: 0, y: 0 };
  pencilPath: Point[] = [];

  reset(): void {
    this.selectedShape = null;
    this.resizingHandle = null;
    this.dragOffset = { x: 0, y: 0 };
    this.isDraggingShape = false;
    this.isDrawing = false;
    this.startPoint = { x: 0, y: 0 };
    this.pencilPath = [];
  }
}

export let existingShapesLength = 0;


export const initDraw = ({
  canvas,
  roomId,
  socket,
  ctx,
  selectedShapeType,
  shapesRef,
  strokeColor,
  strokeWidth,
  backgroundColor,
  redoRef,
  drawingStateRef,
}: InitDrawParams) => {
  const state = new DrawingState();
  drawingStateRef.current = state;

  const handleSocketMessage = (e: MessageEvent) => {
    let data: SocketMessage;
    try {
      data = JSON.parse(e.data);
    } catch (error) {
      console.error("Failed to parse socket message:", error);
      return;
    }

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

      clearCanvas(shapesRef.current, ctx, canvas, state);
    }

    if (data.type === "undo" && data.payload.roomId === roomId) {
      const shapeIndex = shapesRef.current.findIndex(
        (s) => s.id === data.payload.shapeId
      );
      if (shapeIndex !== -1) {
        redoRef.current.push(shapesRef.current[shapeIndex]);
        shapesRef.current.splice(shapeIndex, 1);
        clearCanvas(shapesRef.current, ctx, canvas, state);
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

      clearCanvas(shapesRef.current, ctx, canvas, state);
    }
  };

  socket.onmessage = handleSocketMessage;

  getExistingShapes(roomId, shapesRef).then(() => {
    existingShapesLength = shapesRef.current.length;
    clearCanvas(shapesRef.current, ctx, canvas, state);
  });

  clearCanvas(shapesRef.current, ctx, canvas, state);

  const handleMouseDown = (e: MouseEvent) => {
    state.isDrawing = true;
    const point = getCanvasCoordinates(canvas, e);
    state.startPoint = point;

    if (selectedShapeType === "pencil") {
      state.pencilPath = [point];
    }

    if (selectedShapeType === "select") {
      if (state.selectedShape) {
        const data = parseShapeData(state.selectedShape.data);
        if (!data) return;

        const handle = getHandleUnderCursorHelper(
          state.selectedShape.type as any,
          data,
          point
        );

        if (handle !== null) {
          state.resizingHandle = handle;
          return;
        }
      }

      // Find shape under cursor
      const shape = shapesRef.current.find((s) => isPointOnShape(s, point));

      if (shape) {
        state.selectedShape = shape;
        const data = parseShapeData(shape.data);
        if (data) {
          drawShapeHandlers(ctx, shape);
          state.dragOffset = {
            x: point.x - (data.x || 0),
            y: point.y - (data.y || 0),
          };
          state.isDraggingShape = true;
        }
      } else {
        state.selectedShape = null;
      }
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!state.isDrawing) return;
    state.isDrawing = false;

    const point = getCanvasCoordinates(canvas, e);
    const width = point.x - state.startPoint.x;
    const height = point.y - state.startPoint.y;

    let shape: Shape | null = null;
    let data: any = null;

    const tempId = nanoid();

    if (selectedShapeType === "rect") {
      data = {
        x: state.startPoint.x,
        y: state.startPoint.y,
        width,
        height,
      };
      shape = {
        type: "rect",
        data: JSON.stringify(data),
        strokeColor,
        strokeWidth,
        backgroundColor,
        tempId,
      };
    } else if (selectedShapeType === "circle") {
      data = {
        centerX: state.startPoint.x,
        centerY: state.startPoint.y,
        radius: Math.sqrt(width ** 2 + height ** 2),
      };
      shape = {
        type: "circle",
        data: JSON.stringify(data),
        strokeColor,
        strokeWidth,
        backgroundColor,
        tempId,
      };
    } else if (selectedShapeType === "line") {
      data = {
        startX: state.startPoint.x,
        startY: state.startPoint.y,
        endX: point.x,
        endY: point.y,
      };
      shape = {
        type: "line",
        data: JSON.stringify(data),
        strokeColor,
        strokeWidth,
        backgroundColor,
        tempId,
      };
    } else if (selectedShapeType === "pencil") {
      data = state.pencilPath;
      shape = {
        type: "pencil",
        data: JSON.stringify(data),
        strokeColor,
        strokeWidth,
        backgroundColor,
        tempId,
      };
    } else if (selectedShapeType === "select") {
      state.resizingHandle = null;
      state.isDraggingShape = false;

      if (!state.selectedShape) return;

      socket.send(
        JSON.stringify({
          type: "update",
          payload: {
            id: state.selectedShape.id,
            data: state.selectedShape.data,
            roomId,
          },
        })
      );
      return;
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
    if (!state.isDrawing) return;

    const point = getCanvasCoordinates(canvas, e);
    const width = point.x - state.startPoint.x;
    const height = point.y - state.startPoint.y;
    clearCanvas(shapesRef.current, ctx, canvas, state);

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.fillStyle = backgroundColor;

    switch (selectedShapeType) {
      case "rect":
        drawRectangle(ctx, state.startPoint.x, state.startPoint.y, width, height);
        break;
      case "circle":
        drawCircle(
          ctx,
          state.startPoint.x,
          state.startPoint.y,
          Math.sqrt(width ** 2 + height ** 2)
        );
        break;
      case "line":
        drawLine(ctx, state.startPoint.x, state.startPoint.y, point.x, point.y);
        break;
      case "pencil":
        state.pencilPath.push(point);
        drawPencil(ctx, state.pencilPath);
        break;
      case "select":
        if (state.selectedShape) {
          const data = parseShapeData(state.selectedShape.data);
          if (!data) break;

          if (state.resizingHandle !== null) {
            resizeShapeHelper(
              state.selectedShape.type as any,
              data,
              state.resizingHandle,
              point,
              canvas.width,
              canvas.height
            );
            state.selectedShape.data = JSON.stringify(data);
          } else if (state.isDraggingShape) {
            if (state.selectedShape.type === "rect" || state.selectedShape.type === "circle") {
              data.x = point.x - state.dragOffset.x;
              data.y = point.y - state.dragOffset.y;
            } else if (state.selectedShape.type === "line") {
              const deltaX = point.x - state.dragOffset.x - data.startX;
              const deltaY = point.y - state.dragOffset.y - data.startY;
              data.startX += deltaX;
              data.startY += deltaY;
              data.endX += deltaX;
              data.endY += deltaY;
            }
            state.selectedShape.data = JSON.stringify(data);
          }

          clearCanvas(shapesRef.current, ctx, canvas, state);
        }
        break;
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
    state.reset();
  };
};

/**
 * Fetches existing shapes for a room from the backend
 */
async function getExistingShapes(
  roomId: string,
  shapesRef: React.MutableRefObject<Shape[]>
) {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/user/get-existing-shapes/${roomId}`
    );
    const shapes = response.data.shapes;
    shapesRef.current = shapes;
  } catch (error) {
    console.error("Failed to fetch existing shapes:", error);
    shapesRef.current = [];
  }
}

/**
 * Clears and redraws the entire canvas
 */
export function clearCanvas(
  shapes: Shape[],
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  state: DrawingState
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0, 0, 0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  shapes.forEach((shape) => {
    renderShape(ctx, shape);
  });

  if (state.selectedShape) {
    drawShapeHandlers(ctx, state.selectedShape);
  }
}




