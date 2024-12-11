import { Router } from "express";
import { getUser } from "../controllers/userController.js";

const userRoutes = Router();

userRoutes.get("/:id", getUser);

export { userRoutes };
