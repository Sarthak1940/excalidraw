import { WEBSOCKET_URL } from "@/app/config";
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';

export function useSocket() {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [error, setError] = useState<string | null>(null);
    const token = Cookies.get('token');

    useEffect(() => {
        if (!token) {
            setLoading(false);
            setError('No authentication token found');
            return;
        }

        let ws: WebSocket;
        let reconnectTimeout: NodeJS.Timeout;

        const connect = () => {
            try {
                ws = new WebSocket(`${WEBSOCKET_URL}?token=${token}`);    

                ws.onopen = () => {
                    console.log('WebSocket connected');
                    setLoading(false);
                    setSocket(ws);
                    setError(null);
                }

                ws.onerror = (event) => {
                    console.error('WebSocket error:', event);
                    setError('WebSocket connection error');
                    setLoading(false);
                }

                ws.onclose = (event) => {
                    console.log('WebSocket closed:', event.code, event.reason);
                    setSocket(null);
                    
                    // Attempt to reconnect after 5 seconds if not a normal closure
                    if (event.code !== 1000 && event.code !== 1001) {
                        setError('Connection lost. Reconnecting...');
                        reconnectTimeout = setTimeout(() => {
                            console.log('Attempting to reconnect...');
                            connect();
                        }, 5000);
                    }
                }
            } catch (err) {
                console.error('Failed to create WebSocket:', err);
                setError('Failed to connect to server');
                setLoading(false);
            }
        };

        connect();

        return () => {
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close(1000, 'Component unmounting');
            }
        };
    }, [token]);

    return { loading, socket, error }; 
}