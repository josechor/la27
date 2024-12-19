import { Router } from "express";
import { getUser, getFollowers, getFollowing, authUser, createUser, updateUser, getUserData, followUser, unfollowUser, searchUsers } from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const userRoutes = Router();

userRoutes.get("/userData", authMiddleware, getUserData)
userRoutes.get("/search", authMiddleware, searchUsers);
userRoutes.get("/:username", authMiddleware, getUser);
userRoutes.get("/:username/followers", getFollowers);
userRoutes.get("/:username/following", getFollowing);
userRoutes.post("/auth", authUser)
userRoutes.post("/", createUser);
userRoutes.post("/follow/:username", authMiddleware, followUser);
userRoutes.delete("/follow/:username", authMiddleware, unfollowUser);
userRoutes.patch("/", authMiddleware, updateUser);


export { userRoutes };