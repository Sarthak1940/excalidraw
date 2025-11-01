import { Shape } from "@/types";
import { DRAWING_CONSTANTS } from "./constants";
import {
  CircleData,
  LineData,
  Point,
  RectData,
  ShapeData,
  ShapeType,
  SocketMessage,
} from "./types";
import {
  arePointsClose,
  clamp,
  getCanvasCoordinates,
  isPointInCircle,
  isPointInRect,
  isPointNearLine,
  parseShapeData,
} from "./utils";
import {
  drawCircle,
  drawLine,
  drawPencil,
  drawRectangle,
  drawResizeHandlers,
  drawSelectionBox,
  renderShape,
} from "./shapes";

/**
 * Extracts resize handle positions for a given shape
 */
export function getResizeHandles(
  type: ShapeType,
  data: RectData | CircleData | LineData
): Point[] {
  switch (type) {
    case "rect": {
      const { x, y, width, height } = data as RectData;
      return [
        { x, y }, // top-left
        { x: x + width, y }, // top-right
        { x, y: y + height }, // bottom-left
        { x: x + width, y: y + height }, // bottom-right
      ];
    }

    case "circle": {
      const { centerX, centerY, radius } = data as CircleData;
      return [
        { x: centerX, y: centerY - radius }, // top
        { x: centerX + radius, y: centerY }, // right
        { x: centerX, y: centerY + radius }, // bottom
        { x: centerX - radius, y: centerY }, // left
      ];
    }

    case "line": {
      const { startX, startY, endX, endY } = data as LineData;
      return [
        { x: startX, y: startY }, // start point
        { x: endX, y: endY }, // end point
      ];
    }

    default:
      return [];
  }
}

/**
 * Finds the handle index under the cursor, or null if none
 */
export function getHandleUnderCursor(
  type: ShapeType,
  data: any,
  mousePoint: Point
): number | null {
  const handlers = getResizeHandles(type, data);
  const index = handlers.findIndex(
    ({ x, y }) =>
      arePointsClose(mousePoint.x, x) && arePointsClose(mousePoint.y, y)
  );
  return index === -1 ? null : index;
}

/**
 * Resizes a shape based on handle position and mouse coordinates
 */
export function resizeShape(
  type: ShapeType,
  data: any,
  handle: number,
  mousePoint: Point,
  canvasWidth: number,
  canvasHeight: number
): void {
  if (type === "rect") {
    resizeRectangle(data, handle, mousePoint, canvasWidth, canvasHeight);
  } else if (type === "circle") {
    resizeCircle(data, handle, mousePoint, canvasWidth, canvasHeight);
  } else if (type === "line") {
    resizeLine(data, handle, mousePoint, canvasWidth, canvasHeight);
  }
}

/**
 * Resizes a rectangle shape
 */
function resizeRectangle(
  data: RectData,
  handle: number,
  mousePoint: Point,
  canvasWidth: number,
  canvasHeight: number
): void {
  let { x, y, width, height } = data;
  const oldRight = x + width;
  const oldBottom = y + height;

  switch (handle) {
    case 0: // Top-left
      x = mousePoint.x;
      y = mousePoint.y;
      width = oldRight - mousePoint.x;
      height = oldBottom - mousePoint.y;
      break;
    case 1: // Top-right
      width = Math.abs(x - mousePoint.x);
      height += y - mousePoint.y;
      y = mousePoint.y;
      break;
    case 2: // Bottom-left
      width += x - mousePoint.x;
      height = Math.abs(y - mousePoint.y);
      x = mousePoint.x;
      break;
    case 3: // Bottom-right
      width = Math.abs(x - mousePoint.x);
      height = Math.abs(y - mousePoint.y);
      break;
  }

  // Enforce minimum size
  width = Math.max(width, DRAWING_CONSTANTS.MIN_RECT_SIZE);
  height = Math.max(height, DRAWING_CONSTANTS.MIN_RECT_SIZE);

  // Clamp inside canvas
  x = clamp(x, 0, canvasWidth - width);
  y = clamp(y, 0, canvasHeight - height);

  data.x = x;
  data.y = y;
  data.width = width;
  data.height = height;
}

/**
 * Resizes a circle shape
 */
function resizeCircle(
  data: CircleData,
  handle: number,
  mousePoint: Point,
  canvasWidth: number,
  canvasHeight: number
): void {
  const { centerX, centerY } = data;
  let radius: number;

  switch (handle) {
    case 0: // Top handle
    case 2: // Bottom handle
      radius = Math.abs(mousePoint.y - centerY);
      break;
    case 1: // Right handle
    case 3: // Left handle
      radius = Math.abs(mousePoint.x - centerX);
      break;
    default:
      return;
  }

  // Enforce minimum radius
  radius = Math.max(radius, DRAWING_CONSTANTS.MIN_CIRCLE_RADIUS);

  // Clamp circle within canvas bounds
  radius = Math.min(
    radius,
    Math.min(centerX, canvasWidth - centerX, centerY, canvasHeight - centerY)
  );

  data.radius = radius;
}

/**
 * Resizes a line shape
 */
function resizeLine(
  data: LineData,
  handle: number,
  mousePoint: Point,
  canvasWidth: number,
  canvasHeight: number
): void {
  if (handle === 0) {
    // Resize start point
    data.startX = clamp(mousePoint.x, 0, canvasWidth);
    data.startY = clamp(mousePoint.y, 0, canvasHeight);
  } else if (handle === 1) {
    // Resize end point
    data.endX = clamp(mousePoint.x, 0, canvasWidth);
    data.endY = clamp(mousePoint.y, 0, canvasHeight);
  }
}

/**
 * Checks if a point intersects with a shape
 */
export function isPointOnShape(shape: Shape, point: Point): boolean {
  const data = parseShapeData(shape.data);
  if (!data) return false;

  switch (shape.type) {
    case "rect":
      return isPointInRect(point, data as RectData);
    case "circle":
      return isPointInCircle(point, data as CircleData);
    case "line":
      return isPointNearLine(point, data as LineData);
    default:
      return false;
  }
}

/**
 * Draws resize handlers for a shape
 */
export function drawShapeHandlers(
  ctx: CanvasRenderingContext2D,
  shape: Shape
): void {
  const data = parseShapeData(shape.data);
  if (!data) return;

  if (shape.type === "rect") {
    drawSelectionBox(
      ctx,
      (data as RectData).x,
      (data as RectData).y,
      (data as RectData).width,
      (data as RectData).height
    );
  }

  if (shape.type === "rect" || shape.type === "circle" || shape.type === "line") {
    drawResizeHandlers(ctx, shape.type, data);
  }
}
