import { Router } from "express";
import { getUser, authUser, createUser } from "../controllers/userController.js";

const userRoutes = Router();

userRoutes.get("/:id", getUser);
userRoutes.post("/auth", authUser)
userRoutes.post("/", createUser);

export { userRoutes };
