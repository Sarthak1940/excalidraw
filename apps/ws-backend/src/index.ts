import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET, logger } from "@repo/backend-common/config";
import prisma from '@repo/db/client';
import { wsMessageSchema } from "@repo/common/types";

interface ChatProps {
    socket: WebSocket,
    userId: number
} 

const wss = new WebSocketServer({ port: 8080 });

const userMap = new Map<number, ChatProps[]>(); // roomId and its members

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
        return;
    };

    const queryParams = new URLSearchParams(url.split("?")[1]);
    const token = queryParams.get("token");

    const userId = checkUser(token as string);
    
    if (!userId) {
        ws.close();
        return;
    } 

    ws.on("message", async (message) => {
        let parsedMessage;
        try {
            parsedMessage = JSON.parse(message as unknown as string);
        } catch (error) {
            logger.error('Failed to parse WebSocket message', error);
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
            return;
        }

        // Validate message schema
        const validationResult = wsMessageSchema.safeParse(parsedMessage);
        if (!validationResult.success) {
            logger.warn('Invalid WebSocket message schema', { error: validationResult.error, message: parsedMessage });
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
    })
})