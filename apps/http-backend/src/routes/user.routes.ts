import { Router } from "express";
import { createRoomHandler, getExistingShapes, getRoomId, loginHandler, signupHandler } from "../controllers/user.controllers";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authRateLimiter, apiRateLimiter, readRateLimiter } from "../middlewares/rateLimitMiddleware";

const userRoutes: Router = Router();

// Auth endpoints - strict rate limiting to prevent brute force
userRoutes.post("/signup", authRateLimiter, signupHandler);
userRoutes.post("/login", authRateLimiter, loginHandler);

// Protected endpoints - require auth + moderate rate limiting
userRoutes.post("/room", authMiddleware, apiRateLimiter, createRoomHandler);

// Read endpoints - generous rate limiting
userRoutes.get("/get-existing-shapes/:roomId", readRateLimiter, getExistingShapes);
userRoutes.get("/get-roomId/:slug", readRateLimiter, getRoomId);

export default userRoutes;
