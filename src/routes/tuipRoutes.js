import { Router } from "express";
import {
  getTuip,
  createTuip,
  getTuips,
} from "../controllers/tuipController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const tuipRoutes = Router();

tuipRoutes.get("/", getTuips);
tuipRoutes.get("/:id", getTuip);
tuipRoutes.post("/", authMiddleware, createTuip);

export { tuipRoutes };
