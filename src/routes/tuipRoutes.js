import { Router } from "express";
import {
  getTuip,
  createTuip,
  getTuips,
  setLike,
  removeLike,
} from "../controllers/tuipController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const tuipRoutes = Router();

tuipRoutes.get("/", authMiddleware, getTuips);
tuipRoutes.get("/:id", getTuip);
tuipRoutes.post("/", authMiddleware, createTuip);
tuipRoutes.post("/like/:id", authMiddleware, setLike);
tuipRoutes.delete("/like/:id", authMiddleware, removeLike);

export { tuipRoutes };
