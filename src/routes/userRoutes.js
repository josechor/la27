import { Router } from "express";
import { getUser, getFollowers, authUser, createUser } from "../controllers/userController.js";

const userRoutes = Router();

userRoutes.get("/:id", getUser);
userRoutes.get("/:id/followers", getFollowers);
userRoutes.post("/auth", authUser)
userRoutes.post("/", createUser);

export { userRoutes };
