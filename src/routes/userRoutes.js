import { Router } from "express";
import { getUser, getFollowers, getFollowing, authUser, createUser, updateUser, getUserData } from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const userRoutes = Router();

userRoutes.get("/userData", authMiddleware, getUserData)
userRoutes.get("/:username", getUser);
userRoutes.get("/:username/followers", getFollowers);
userRoutes.get("/:username/following", getFollowing);
userRoutes.post("/auth", authUser)
userRoutes.post("/", createUser);
userRoutes.patch("/", authMiddleware, updateUser);

export { userRoutes };