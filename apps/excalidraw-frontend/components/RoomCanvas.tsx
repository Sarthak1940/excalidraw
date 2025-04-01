"use client"
import { useSocket } from "@/hooks/useSocket";
import { useEffect } from "react";
import Canvas from "./Canvas";

export default function RoomCanvas({roomId}: {roomId: string}) {
    const {socket, loading} = useSocket();

    useEffect(() => {
        if (!socket || loading) return;

        socket.send(JSON.stringify({
            type: "join_room",
            payload: {
                roomId
            }
        }))


    }, [socket, loading, roomId]);

    if (!socket || loading) return <div>Connecting to Server...</div>;

    return <Canvas roomId={roomId} socket={socket}/>
} 