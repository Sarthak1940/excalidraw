import { Shape } from "@/types";

function normalizeRect(x: number, y: number, width: number, height: number) {
    const left = width < 0 ? x + width : x;
    const top = height < 0 ? y + height : y;
    const normalizedWidth = Math.abs(width);
    const normalizedHeight = Math.abs(height);

    return { x: left, y: top, width: normalizedWidth, height: normalizedHeight };
}

export function renderShape(ctx: CanvasRenderingContext2D, shape: Shape) {
    const data = JSON.parse(shape.data);
    ctx.strokeStyle = shape.strokeColor;
    ctx.lineWidth = shape.strokeWidth;
    ctx.fillStyle = shape.backgroundColor;

    switch (shape.type) {
        case "rect":
            drawRectangle(ctx, data.x, data.y, data.width, data.height);
            break;
        case "circle":
            drawCircle(ctx, data.centerX, data.centerY, data.radius);
            break;
        case "line":
            drawLine(ctx, data.startX, data.startY, data.endX, data.endY);
            break;
        case "pencil":
            drawPencil(ctx, data);
            break;
    }
}


export function drawRectangle(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
    const { x: normX, y: normY, width: normW, height: normH } = normalizeRect(x, y, width, height);
    ctx.beginPath();
    ctx.rect(normX, normY, normW, normH);
    ctx.fill(); 
    ctx.stroke();
    ctx.closePath();
}

export function drawCircle(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}

export function drawLine(ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.closePath();
}

export function drawPencil(ctx: CanvasRenderingContext2D, pencilPath: {x: number, y: number}[]) {
    ctx.beginPath();
    ctx.moveTo(pencilPath[0].x, pencilPath[0].y);
    pencilPath.forEach((point) => {
        ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
    ctx.closePath();
}

export function drawSelectionBox(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
    ctx.setLineDash([5, 3]);
    const left = Math.min(x, x + width);
    const top = Math.min(y, y + height);
    const normalizedWidth = Math.abs(width);
    const normalizedHeight = Math.abs(height);
    ctx.strokeRect(left, top, normalizedWidth, normalizedHeight);
    ctx.setLineDash([]);
}

export function drawResizeHandlers(
    ctx: CanvasRenderingContext2D,
    type: "rect" | "circle" | "line",
    data: any
) {
    const size = 8; // Diameter of the resize handle
    const radius = size / 2;
    ctx.fillStyle = "#00FFFF";
    ctx.strokeStyle = "#000"; // Black border for better visibility
    ctx.lineWidth = 1.5;

    if (type === "rect") {
        const { x, y, width, height } = data;
        const handlers = [
            { x: x, y: y }, // Top-left
            { x: x + width, y: y }, // Top-right
            { x: x, y: y + height }, // Bottom-left
            { x: x + width, y: y + height }, // Bottom-right
        ];
        handlers.forEach(({ x, y }) => drawCircle(ctx, x, y, radius));
    }

    if (type === "circle") {
        const { centerX, centerY, radius } = data;
        const handlers = [
            { x: centerX, y: centerY - radius }, // Top
            { x: centerX + radius, y: centerY }, // Right
            { x: centerX, y: centerY + radius }, // Bottom
            { x: centerX - radius, y: centerY }  // Left
        ];
        handlers.forEach(({ x, y }) => drawCircle(ctx, x, y, radius/15));
    }

    if (type === "line") {
        const { startX, startY, endX, endY } = data;
        const handlers = [
            { x: startX, y: startY }, // Start point
            { x: endX, y: endY }      // End point
        ];
        handlers.forEach(({ x, y }) => drawCircle(ctx, x, y, radius));
    }
}


