"use client"
import { clearCanvas, existingShapesLength, initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { Button } from "@repo/ui/button"
import { Square, Minus, Circle, MousePointer2, Pencil } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@repo/ui/tooltip"
import { Shape } from "@/types";

export default function Canvas({roomId, socket}: {
    roomId: string,
    socket: WebSocket
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const shapesRef = useRef<Shape[]>([]);
    const redoRef = useRef<Shape[]>([]);
    const drawingStateRef = useRef<any>(null);

    const [selectedShape, setSelectedShape] = useState("rect");
    const [strokeColor, setStrokeColor] = useState("#ffffff");
    const [backgroundColor, setBackgroundColor] = useState("transparent");
    const [strokeWidth, setStrokeWidth] = useState(2);

    useEffect(() => {
        if (!canvasRef || !canvasRef.current) return;
        const canvas = canvasRef.current;

        const ctx = canvas.getContext("2d");

        if (!ctx) return;
        
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            if (drawingStateRef.current) {
                clearCanvas(shapesRef.current, ctx, canvas, drawingStateRef.current);
            }
        };

        resize();

        window.addEventListener("resize", resize);
        window.addEventListener("keydown", (e) => {
            if (e.ctrlKey && e.key === "z") undo();
            if (e.ctrlKey && e.key === "y") redo();
        })

        const cleanup = initDraw({ canvas, roomId, socket, ctx, selectedShapeType: selectedShape, shapesRef, strokeColor, strokeWidth, backgroundColor, redoRef, drawingStateRef });

        return () => {
            cleanup();
            window.removeEventListener("resize", resize);
            window.removeEventListener("keydown", (e) => {
                if (e.ctrlKey && e.key === "z") undo();
                if (e.ctrlKey && e.key === "y") redo();
            })
        };
        
    }, [roomId, socket, selectedShape, strokeColor, strokeWidth, backgroundColor]);

    function undo() {
        if (shapesRef.current.length <= existingShapesLength) return;
        const shape = shapesRef.current.pop();
        
        
        if (shape) {
            redoRef.current.push(shape);
            if (shape.id) {
                socket.send(JSON.stringify({
                    type: "undo",
                    payload: {
                        roomId,
                        id: shape.id
                    }
                }))
            }
            
            if (drawingStateRef.current && canvasRef.current) {
                clearCanvas(shapesRef.current, canvasRef.current.getContext("2d")!, canvasRef.current, drawingStateRef.current);
            }
        }
    }

    function redo() {
        if (redoRef.current.length === 0) return;
        const shape = redoRef.current.pop();
        if (shape) {
            shapesRef.current.push(shape);
            socket.send(JSON.stringify({
                type: "redo",
                payload: {
                    shape,
                    roomId
                }
            }))
            if (drawingStateRef.current && canvasRef.current) {
                clearCanvas(shapesRef.current, canvasRef.current.getContext("2d")!, canvasRef.current, drawingStateRef.current);
            }
        }
    }


    return (
    <div className="flex h-screen">
    {/* Drawing Sidebar */}
    
        <div className="w-64 bg-[#1e1e1e] absolute z-10 left-0 top-12 border-r border-[#3a3a3a] p-4 flex flex-col gap-6 overflow-y-auto">
            <div>
                <h3 className="text-gray-300 text-sm mb-2">Stroke</h3>
                <div className="grid grid-cols-6 gap-2">
                    {["#ffffff", "#ff6b81", "#2ecc71", "#3498db", "#e67e22", "#e84118"].map((color) => (
                        <button
                            key={color}
                            className={`w-8 h-8 rounded-sm cursor-pointer transition-all duration-150 ${
                                strokeColor === color 
                                    ? "ring-2 ring-[#6c63ff] ring-offset-1 ring-offset-[#1e1e1e]" 
                                    : "hover:ring-1 hover:ring-gray-400"
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setStrokeColor(color)}
                        />
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-gray-300 text-sm mb-2">Background</h3>
                <div className="grid grid-cols-6 gap-2">
                    {["#7f0000", "#004d00", "#00008b", "#654321", "transparent"].map((color, index) => (
                        <button
                            key={index}
                            className={`w-8 h-8 cursor-pointer rounded-sm transition-all duration-150 ${
                                backgroundColor === color 
                                    ? "ring-2 ring-[#6c63ff] ring-offset-1 ring-offset-[#1e1e1e]" 
                                    : "hover:ring-1 hover:ring-gray-400"
                            } ${color === "transparent" ? "bg-[#2c2c2c]" : ""}`}
                            style={{ 
                                backgroundColor: color === "transparent" ? "#2c2c2c" : color,
                                backgroundImage: color === "transparent" && index === 5 ? "url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 0H16V8H8V0Z' fill='%23404040'/%3E%3Cpath d='M0 8H8V16H0V8Z' fill='%23404040'/%3E%3C/svg%3E\")" : "none",
                                backgroundSize: "8px 8px"
                            }}
                            onClick={() => setBackgroundColor(color)}
                        />
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-gray-300 text-sm mb-2">Stroke width</h3>
                <div className="grid grid-cols-3 gap-2">
                    {[2, 3, 4].map((width) => (
                        <button
                            key={width}
                            className={`h-10 rounded-sm cursor-pointer flex items-center justify-center transition-all duration-150 ${
                                strokeWidth === width 
                                    ? "bg-[#6c63ff] text-white" 
                                    : "bg-[#2c2c2c] text-gray-300 hover:bg-[#3f3f3f]"
                            }`}
                            onClick={() => setStrokeWidth(width)}
                        >
                            <div 
                                className="bg-current rounded-full" 
                                style={{ 
                                    height: `${width}px`, 
                                    width: '50%' 
                                }} 
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-gray-300 text-sm mb-2">Stroke style</h3>
                <div className="grid grid-cols-3 gap-2">
                    {["solid", "dashed", "dotted"].map((style) => (
                        <button
                            key={style}
                            className={`h-10 rounded-sm cursor-pointer flex items-center justify-center transition-all duration-150 
                                bg-[#2c2c2c] text-gray-300 hover:bg-[#3f3f3f]`}
                        >
                            <div className="w-1/2 flex items-center">
                                {style === "solid" && <div className="h-0.5 w-full bg-current" />}
                                {style === "dashed" && (
                                    <div className="h-0.5 w-full bg-current" style={{ 
                                        backgroundImage: 'linear-gradient(to right, currentColor 50%, transparent 50%)',
                                        backgroundSize: '8px 100%'
                                    }} />
                                )}
                                {style === "dotted" && (
                                    <div className="h-0.5 w-full bg-current" style={{ 
                                        backgroundImage: 'linear-gradient(to right, currentColor 25%, transparent 25%)',
                                        backgroundSize: '4px 100%'
                                    }} />
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    

    <div className="flex-1 relative">
        {/* Toggle sidebar button */}
        

        {/* Shape tools */}
        <div className="p-2 flex gap-1 absolute right-4 top-4 bg-[#2c2c2c] backdrop-blur-sm rounded-md shadow-md border border-[#3a3a3a]">
            <TooltipProvider>
                {["rect", "line", "circle", "select", "pencil"].map((shape) => (
                <Tooltip key={shape}>
                    <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        onClick={() => setSelectedShape(shape)}
                        size="icon"
                        className={`
                        w-8 h-8 flex items-center justify-center
                        rounded-sm transition-colors duration-150
                        shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]
                        ${
                            selectedShape === shape
                            ? "bg-[#6c63ff] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]"
                            : "bg-transparent text-gray-300 hover:bg-[#3f3f3f] hover:text-white"
                        }
                        active:scale-95
                        `}
                    >
                        {shape === "rect" && <Square size={16} />}
                        {shape === "line" && <Minus size={16} />}
                        {shape === "circle" && <Circle size={16} />}
                        {shape === "select" && <MousePointer2 size={16} />}
                        {shape === "pencil" && <Pencil size={16} />}
                    </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                    <p className="text-xs capitalize text-white">{shape}</p>
                    </TooltipContent>
                </Tooltip>
                ))}
            </TooltipProvider>
        </div>
        
        <canvas ref={canvasRef} style={{ display: "block" }}></canvas>
    </div>
</div>
    )
}

