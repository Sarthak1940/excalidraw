import { Router } from "express";
import { createRoomHandler, getExistingShapes, getRoomId, loginHandler, signupHandler } from "../controllers/user.controllers";
import { authMiddleware } from "../middlewares/authMiddleware";

const userRoutes: Router = Router();

userRoutes.post("/signup", signupHandler);
userRoutes.post("/login", loginHandler);
userRoutes.post("/room", authMiddleware, createRoomHandler);
userRoutes.get("/get-existing-shapes/:roomId", getExistingShapes);
userRoutes.get("/get-roomId/:slug", getRoomId);

export default userRoutes;
