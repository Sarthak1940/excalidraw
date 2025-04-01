import { z } from 'zod';

export const createUserSchema = z.object({
    email: z.string().email(),
    password: z.string(),
    name: z.string(),
})

export const signinSchema = z.object({
    email: z.string().email(),
    password: z.string(),
})

export const createRoomSchema = z.object({
    slug: z.string()
})