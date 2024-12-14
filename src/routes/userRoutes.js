import { Router } from "express";
import { getUser, getFollowers, getFollowing, authUser, createUser } from "../controllers/userController.js";

const userRoutes = Router();

userRoutes.get("/:id", getUser);
userRoutes.get("/:id/followers", getFollowers);
userRoutes.get("/:id/following", getFollowing);
userRoutes.post("/auth", authUser)
userRoutes.post("/", createUser);

export { userRoutes };
