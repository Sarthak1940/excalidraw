import 'dotenv/config';
import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET, logger } from "@repo/backend-common/config";
import prisma from '@repo/db/client';
import { wsMessageSchema } from "@repo/common/types";

interface ChatProps {
    socket: WebSocket,
    userId: number
} 

const WS_PORT = Number(process.env.WS_PORT) || 8080;
const MAX_CONNECTIONS = 10000;
const MESSAGE_SIZE_LIMIT = 100000; // 100KB per message

const wss = new WebSocketServer({ 
    port: WS_PORT,
    maxPayload: MESSAGE_SIZE_LIMIT,
});

const userMap = new Map<number, ChatProps[]>(); // roomId and its members
const connectionCount = new Map<number, number>(); // userId -> connection count

logger.info(`WebSocket server starting on port ${WS_PORT}`);

function checkUser(token: string): number | null {
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        if (!decoded || !decoded.id) {
            return null;
        }

        return decoded.id;
    } catch (error) {
        logger.warn('Invalid token', { error });
        return null
    }
}

async function createShape(data: string, type: string, strokeWidth: number, strokeColor: string, backgroundColor: string, userId: number, roomId: number) {
    const shape = await prisma.shape.create({
        data: {
            type,
            strokeWidth,
            strokeColor,
            data,
            backgroundColor,
            userId,
            roomId: Number(roomId) 
        }
    })

    return shape.id;
}

async function deleteShape(shapeId: number) {
    try {
        await prisma.shape.delete({
            where: {
                id: shapeId
            }
        })
    } catch (error) {
        logger.error('Failed to delete shape', error, { shapeId })
    }
}

async function updateShape(shapeId: number, data: string) {
    try {
        const shape = await prisma.shape.update({
            where: {
                id: shapeId
            },
            data: {
                data
            }
        })

        return shape;
    } catch (error) {
        logger.error('Failed to update shape', error, { shapeId })
        return null;
    }
}

wss.on("connection", (ws, req) => {
    const url = req.url;

    if (!url) {
        ws.close(1008, 'Missing URL');
        return;
    };

    // Check total connections
    if (wss.clients.size > MAX_CONNECTIONS) {
        logger.warn('Max connections reached', { count: wss.clients.size });
        ws.close(1008, 'Server at capacity');
        return;
    }

    const queryParams = new URLSearchParams(url.split("?")[1]);
    const token = queryParams.get("token");

    const userId = checkUser(token as string);
    
    if (!userId) {
        ws.close(1008, 'Invalid token');
        return;
    }

    // Track user connections
    const userConnections = connectionCount.get(userId) || 0;
    connectionCount.set(userId, userConnections + 1);

    logger.info('WebSocket connection established', { userId, totalConnections: wss.clients.size });

    // Set up heartbeat
    let isAlive = true;
    ws.on('pong', () => { isAlive = true; });

    const heartbeatInterval = setInterval(() => {
        if (!isAlive) {
            logger.warn('WebSocket connection stale, terminating', { userId });
            ws.terminate();
            return;
        }
        isAlive = false;
        ws.ping();
    }, 30000); // 30 seconds

    // Cleanup function
    const cleanup = () => {
        clearInterval(heartbeatInterval);
        
        // Remove from all rooms
        for (const [roomId, members] of userMap.entries()) {
            const index = members.findIndex(m => m.socket === ws);
            if (index !== -1) {
                members.splice(index, 1);
                logger.info('User removed from room', { userId, roomId });
            }
            // Clean up empty rooms
            if (members.length === 0) {
                userMap.delete(roomId);
            }
        }
        
        // Decrement connection count
        const count = connectionCount.get(userId) || 1;
        if (count <= 1) {
            connectionCount.delete(userId);
        } else {
            connectionCount.set(userId, count - 1);
        }
        
        logger.info('WebSocket connection closed', { userId, totalConnections: wss.clients.size });
    };

    ws.on("close", cleanup);
    ws.on("error", (error) => {
        logger.error('WebSocket error', error, { userId });
        cleanup();
    });

    ws.on("message", async (message) => {
        // Check message size
        if (message.toString().length > MESSAGE_SIZE_LIMIT) {
            logger.warn('Message too large', { userId, size: message.toString().length });
            ws.send(JSON.stringify({ type: 'error', message: 'Message too large' }));
            return;
        }

        let parsedMessage;
        try {
            parsedMessage = JSON.parse(message as unknown as string);
        } catch (error) {
            logger.error('Failed to parse WebSocket message', { error, userId });
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
            return;
        }

        // Validate message schema
        const validationResult = wsMessageSchema.safeParse(parsedMessage);
        if (!validationResult.success) {
            logger.warn('Invalid WebSocket message schema', { 
                error: validationResult.error.errors, 
                userId 
            });
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid message schema' }));
            return;
        }

        const validMessage = validationResult.data;
        
        if (validMessage.type === "join_room") {
            const roomId = validMessage.payload.roomId;
            
            if (!userMap.has(roomId)) {
                userMap.set(roomId, []);
            }

            userMap.get(roomId)?.push({
                socket: ws,
                userId: userId
            });
        }

        if (validMessage.type === "leave_room") {
            const members = userMap.get(validMessage.payload.roomId);
            const index = members?.findIndex((member) => member.userId === userId);
            members?.splice(index as number, 1);
        }

        if (validMessage.type === "shape") {
            const data = validMessage.payload.data;
            const type = validMessage.payload.type;
            const strokeColor = validMessage.payload.strokeColor;
            const strokeWidth = validMessage.payload.strokeWidth;
            const backgroundColor = validMessage.payload.backgroundColor;
            const roomId = validMessage.payload.roomId;
            const tempId = validMessage.payload.tempId;
            const members = userMap.get(roomId);
            
            const shapeId = await createShape(data, type, strokeWidth, strokeColor, backgroundColor, userId, roomId);

            members?.forEach((member) => {
                member.socket.send(JSON.stringify({
                    type: "shape",
                    payload: {
                        data,
                        type,
                        strokeColor,
                        strokeWidth,
                        backgroundColor,
                        userId,
                        roomId,
                        shapeId,
                        tempId
                    }
                }));
            })
        }

        if (validMessage.type === "undo") {
            
            const roomId = validMessage.payload.roomId;
            const members = userMap.get(roomId);
            const shapeId = validMessage.payload.id;
            await deleteShape(shapeId);

            members?.forEach((member) => {
                if (member.userId === userId) return;

                member.socket.send(JSON.stringify({
                    type: "undo",
                    payload: {
                        roomId,
                        shapeId
                    }
                }));
            })
        }

        if (validMessage.type === "redo") {
            const shape = validMessage.payload.shape
            const data = shape.data;
            const type = shape.type;
            const strokeColor = shape.strokeColor;
            const strokeWidth = shape.strokeWidth;
            const backgroundColor = shape.backgroundColor;
            const roomId = validMessage.payload.roomId;
            const tempId = shape.tempId;
            const members = userMap.get(roomId);

            const shapeId = await createShape(data, type, strokeWidth, strokeColor, backgroundColor, userId, roomId);

            members?.forEach((member) => {
                member.socket.send(JSON.stringify({
                    type: "shape",
                    payload: {
                        data,
                        type,
                        strokeColor,
                        strokeWidth,
                        backgroundColor,
                        userId,
                        roomId,
                        shapeId,
                        tempId
                    }
                }));
            })
        }

        if (validMessage.type === "update") {
            const data = validMessage.payload.data;
            const id = validMessage.payload.id;
            const members = userMap.get(validMessage.payload.roomId);

            const shape = await updateShape(id, data);

            members?.forEach((member) => {
                if (member.userId === userId) return;

                member.socket.send(JSON.stringify({
                    type: "update",
                    payload: {
                        data,
                        type: shape?.type,
                        strokeColor: shape?.strokeColor,
                        strokeWidth: shape?.strokeWidth,
                        backgroundColor: shape?.backgroundColor,
                        userId,
                        roomId: validMessage.payload.roomId,
                        shapeId: shape?.id,
                    }
                }));
            })
        }
    });
});