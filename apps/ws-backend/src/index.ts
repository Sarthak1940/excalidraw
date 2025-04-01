import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import prisma from '@repo/db/client';

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
        console.log(error);
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
        console.log(error)
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
        console.log(error)
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
        const parsedMessage = JSON.parse(message as unknown as string);
        
        if (parsedMessage.type === "join_room") {
            const roomId = parsedMessage.payload.roomId;
            
            if (!userMap.has(roomId)) {
                userMap.set(roomId, []);
            }

            userMap.get(roomId)?.push({
                socket: ws,
                userId: userId
            });
        }

        if (parsedMessage.type === "leave_room") {
            const members = userMap.get(parsedMessage.payload.roomId);
            const index = members?.findIndex((member) => member.userId === userId);
            members?.splice(index as number, 1);
        }

        if (parsedMessage.type === "shape") {
            const data = parsedMessage.payload.data;
            const type = parsedMessage.payload.type;
            const strokeColor = parsedMessage.payload.strokeColor;
            const strokeWidth = parsedMessage.payload.strokeWidth;
            const backgroundColor = parsedMessage.payload.backgroundColor;
            const roomId = parsedMessage.payload.roomId;
            const tempId = parsedMessage.payload.tempId;
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

        if (parsedMessage.type === "undo") {
            
            const roomId = parsedMessage.payload.roomId;
            const members = userMap.get(roomId);
            const shapeId = parsedMessage.payload.id;
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

        if (parsedMessage.type === "redo") {
            const shape = parsedMessage.payload.shape
            const data = shape.data;
            const type = shape.type;
            const strokeColor = shape.strokeColor;
            const strokeWidth = shape.strokeWidth;
            const backgroundColor = shape.backgroundColor;
            const roomId = parsedMessage.payload.roomId;
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

        if (parsedMessage.type === "update") {
            const data = parsedMessage.payload.data;
            const id = parsedMessage.payload.id;
            const members = userMap.get(parsedMessage.payload.roomId);

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
                        roomId: parsedMessage.payload.roomId,
                        shapeId: shape?.id,
                    }
                }));
            })
        }
    })
})