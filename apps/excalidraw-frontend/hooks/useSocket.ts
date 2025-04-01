import { WEBSOCKET_URL } from "@/app/config";
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';

export function useSocket() {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const token = Cookies.get('token');

    useEffect(() => {
        console.log(token);
        const ws = new WebSocket(`${WEBSOCKET_URL}?token=${token}`);    

        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        }
        

        return () => ws.close();
    }, []);

    return {loading, socket}; 
}