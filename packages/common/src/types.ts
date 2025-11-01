import { z } from 'zod';

export const createUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(1),
})

export const signinSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export const createRoomSchema = z.object({
    slug: z.string().min(1).max(100)
})

// WebSocket message schemas
export const wsJoinRoomSchema = z.object({
    type: z.literal("join_room"),
    payload: z.object({
        roomId: z.number()
    })
})

export const wsLeaveRoomSchema = z.object({
    type: z.literal("leave_room"),
    payload: z.object({
        roomId: z.number()
    })
})

export const wsShapeSchema = z.object({
    type: z.literal("shape"),
    payload: z.object({
        data: z.string().max(100000), // Limit JSON size
        type: z.enum(["rect", "circle", "line", "pencil"]),
        strokeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
        strokeWidth: z.number().min(1).max(20),
        backgroundColor: z.string(),
        roomId: z.number(),
        tempId: z.string()
    })
})

export const wsUndoSchema = z.object({
    type: z.literal("undo"),
    payload: z.object({
        roomId: z.number(),
        id: z.number()
    })
})

export const wsRedoSchema = z.object({
    type: z.literal("redo"),
    payload: z.object({
        shape: z.object({
            data: z.string().max(100000),
            type: z.string(),
            strokeColor: z.string(),
            strokeWidth: z.number(),
            backgroundColor: z.string(),
            tempId: z.string()
        }),
        roomId: z.number()
    })
})

export const wsUpdateSchema = z.object({
    type: z.literal("update"),
    payload: z.object({
        id: z.number(),
        data: z.string().max(100000),
        roomId: z.number()
    })
})

export const wsMessageSchema = z.discriminatedUnion("type", [
    wsJoinRoomSchema,
    wsLeaveRoomSchema,
    wsShapeSchema,
    wsUndoSchema,
    wsRedoSchema,
    wsUpdateSchema
])