import { DRAWING_CONSTANTS } from "./constants";
import { CircleData, LineData, Point, RectData, ShapeData } from "./types";

/**
 * Converts mouse event coordinates to canvas-relative coordinates
 */
export function getCanvasCoordinates(
  canvas: HTMLCanvasElement,
  e: MouseEvent
): Point {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

/**
 * Safely parses JSON shape data with error handling
 */
export function parseShapeData<T = any>(dataString: string): T | null {
  try {
    return JSON.parse(dataString) as T;
  } catch (error) {
    console.error("Failed to parse shape data:", error);
    return null;
  }
}

/**
 * Checks if two points are close enough to be considered the same
 */
export function arePointsClose(
  p1: number,
  p2: number,
  tolerance: number = DRAWING_CONSTANTS.SELECTION_TOLERANCE
): boolean {
  return Math.abs(p1 - p2) < tolerance;
}

/**
 * Clamps a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

/**
 * Checks if a point is inside a rectangle
 */
export function isPointInRect(
  point: Point,
  rectData: RectData
): boolean {
  const left = Math.min(rectData.x, rectData.x + rectData.width);
  const right = Math.max(rectData.x, rectData.x + rectData.width);
  const top = Math.min(rectData.y, rectData.y + rectData.height);
  const bottom = Math.max(rectData.y, rectData.y + rectData.height);

  return (
    point.x >= left &&
    point.x <= right &&
    point.y >= top &&
    point.y <= bottom
  );
}

/**
 * Checks if a point is inside a circle
 */
export function isPointInCircle(
  point: Point,
  circleData: CircleData
): boolean {
  const distance = Math.sqrt(
    (point.x - circleData.centerX) ** 2 +
    (point.y - circleData.centerY) ** 2
  );
  return distance <= circleData.radius;
}

/**
 * Calculates the distance from a point to a line
 */
export function distanceToLine(
  point: Point,
  lineData: LineData
): number {
  const { startX: x1, startY: y1, endX: x2, endY: y2 } = lineData;
  const numerator = Math.abs(
    (y2 - y1) * point.x - (x2 - x1) * point.y + x2 * y1 - y2 * x1
  );
  const denominator = Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
  return numerator / denominator;
}

/**
 * Checks if a point is near a line
 */
export function isPointNearLine(
  point: Point,
  lineData: LineData,
  tolerance: number = DRAWING_CONSTANTS.LINE_CLICK_TOLERANCE
): boolean {
  return distanceToLine(point, lineData) < tolerance;
}
