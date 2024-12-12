import { Router } from "express";
import { getUser, loginUser, createUser } from "../controllers/userController.js";

const userRoutes = Router();

userRoutes.get("/:id", getUser);
userRoutes.get("/login", loginUser)
userRoutes.post("/", createUser);

export { userRoutes };
