import prisma from "@repo/db/client";
import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import { JWT_SECRET, logger } from "@repo/backend-common/config";
import { createRoomSchema, createUserSchema, signinSchema } from "@repo/common/types";

const options = {
  expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? "none" as "none" : "lax" as "lax"
}

export const signupHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = createUserSchema.safeParse(req.body);
        if (!data.success) {
            res.status(400).json({ message: 'Invalid data' });
            return;
        }

        const { email, password, name } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name
            },
            select: {
                id: true,
                email: true,
                name: true
            }
        })

        const token = jwt.sign({ id: user.id }, JWT_SECRET as string, { expiresIn: '90d' });

        res.status(200).cookie("token", token, options).json({ user: user, token });
    } catch (error) {
        logger.error('Signup failed', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const loginHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = signinSchema.safeParse(req.body);
        if (!data.success) {
            res.status(400).json({ message: 'Invalid data' });
            return;
        }

        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        if (!await bcrypt.compare(password, user.password)) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET as string, { expiresIn: '90d' });

        // Return user without password
        const userWithoutPassword = {
            id: user.id,
            email: user.email,
            name: user.name
        };

        res.status(200).cookie("token", token, options).json({ user: userWithoutPassword, token });
    } catch (error) {
        logger.error('Login failed', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const createRoomHandler = async (req: Request, res: Response): Promise<void> => {
    const data = createRoomSchema.safeParse(req.body);
    if (!data.success) {
        res.status(400).json({ message: 'Invalid data' });
        return;
    }
    
    const { slug } = req.body;

    const userId = req.userId as number;

    try {
       const room = await prisma.room.create({
        data: {
            slug,
            adminId: userId
        }
       })

        res.status(201).json({ message: 'Room created', id: room.id});
    } catch (error) {
        logger.error('Room creation failed', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const getExistingShapes = async (req: Request, res: Response) => {
    const roomId = Number(req.params.roomId);

    // Validate roomId
    if (isNaN(roomId) || roomId <= 0) {
        res.status(400).json({ message: 'Invalid room ID' });
        return;
    }

    try {
        const shapes = await prisma.shape.findMany({
            where: {
                roomId: roomId
            },
            orderBy: {
                createdAt: "asc" // Changed from "id: desc" to get shapes in chronological order
            },
            take: 1000
        })

        res.status(200).json({ shapes })
    } catch (error) {
        logger.error('Failed to fetch shapes', error, { roomId });
        res.status(500).json({ message: "Could not fetch shapes" })
    }
}

export const getRoomId = async (req: Request, res: Response) => {
    const { slug } = req.params;
    
    if (!slug || slug.trim().length === 0) {
        res.status(400).json({ message: "Invalid slug" });
        return;
    }
    
    try {
        const room = await prisma.room.findUnique({
            where: {
                slug
            }
        })

        if (!room) {
            res.status(404).json({ message: "Room not found" });
            return;
        }

        res.status(200).json({ roomId: room.id });
    } catch (error) {
        logger.error('Failed to fetch room', error, { slug });
        res.status(500).json({ message: "Could not fetch room" })
    }
}

export const getAllRoomsForUser = async (req: Request, res: Response) => {
    const userId = req.userId as number;

    try {
        const rooms = await prisma.room.findMany({
            where: {
                adminId: userId
            }
        })

        res.status(200).json({ rooms });
    } catch (error) {
        logger.error('Failed to fetch rooms', error, { userId });
        res.status(500).json({ message: "Could not fetch rooms" })
    }
}