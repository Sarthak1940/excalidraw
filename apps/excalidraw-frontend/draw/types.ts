/**
 * Type definitions for shape data structures
 */

export interface RectData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CircleData {
  centerX: number;
  centerY: number;
  radius: number;
}

export interface LineData {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface PencilData {
  x: number;
  y: number;
}

export type ShapeData = RectData | CircleData | LineData | PencilData[];

export type ShapeType = "rect" | "circle" | "line" | "pencil" | "select";

export interface Point {
  x: number;
  y: number;
}

/**
 * Socket message types
 */
export interface SocketMessage {
  type: "shape" | "undo" | "redo" | "update";
  payload: any;
}

export interface ShapePayload {
  id?: number;
  tempId: string;
  shapeId?: number;
  type: string;
  data: string;
  strokeColor: string;
  strokeWidth: number;
  backgroundColor: string;
  roomId: string;
}
