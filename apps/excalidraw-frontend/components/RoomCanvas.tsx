"use client"
import { useSocket } from "@/hooks/useSocket";
import { useEffect } from "react";
import Canvas from "./Canvas";
import { Loader2 } from "lucide-react";

export default function RoomCanvas({roomId}: {roomId: number}) {
    const {socket, loading, error} = useSocket();

    useEffect(() => {
        if (!socket || loading) return;

        socket.send(JSON.stringify({
            type: "join_room",
            payload: {
                roomId
            }
        }))
    }, [socket, loading, roomId]);

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-50 to-slate-50">
                <div className="text-center">
                    <div className="bg-red-100 text-red-600 rounded-full p-4 mb-4 inline-block">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-slate-900 mb-2">Connection Failed</h2>
                    <p className="text-slate-600 mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!socket || loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-slate-900 mb-2">Connecting to Server</h2>
                    <p className="text-slate-600">Setting up your canvas...</p>
                </div>
            </div>
        );
    }

    return <Canvas roomId={roomId} socket={socket}/>
} 