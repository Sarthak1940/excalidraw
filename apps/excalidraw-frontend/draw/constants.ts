/**
 * Drawing constants for canvas interactions
 */
export const DRAWING_CONSTANTS = {
  /** Tolerance for clicking near shapes (in pixels) */
  SELECTION_TOLERANCE: 10,
  
  /** Tolerance for clicking on lines (in pixels) */
  LINE_CLICK_TOLERANCE: 5,
  
  /** Minimum width/height for rectangles (in pixels) */
  MIN_RECT_SIZE: 10,
  
  /** Minimum radius for circles (in pixels) */
  MIN_CIRCLE_RADIUS: 5,
  
  /** Size of resize handles (in pixels) */
  RESIZE_HANDLE_SIZE: 8,
  
  /** Color for resize handles */
  HANDLE_COLOR: "#00FFFF",
  
  /** Border color for resize handles */
  HANDLE_BORDER_COLOR: "#000",
  
  /** Line width for handle borders */
  HANDLE_BORDER_WIDTH: 1.5,
  
  /** Dash pattern for selection box [dash length, gap length] */
  SELECTION_DASH_PATTERN: [5, 3] as const,
} as const;
