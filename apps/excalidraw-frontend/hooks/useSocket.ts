import { WEBSOCKET_URL } from "@/app/config";
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';

export function useSocket() {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const token = Cookies.get('token');

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        const ws = new WebSocket(`${WEBSOCKET_URL}?token=${token}`);    

        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        }

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setLoading(false);
        }

        return () => {
            ws.close();
        };
    }, [token]);

    return {loading, socket}; 
}