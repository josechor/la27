import { Router } from "express";
import {
  getTuip,
  createTuip,
  getTuips,
  setLike,
  removeLike,
  getEndemoniados,
} from "../controllers/tuipController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const tuipRoutes = Router();

tuipRoutes.get("/", authMiddleware, getTuips);
tuipRoutes.get("/endemoniados", getEndemoniados);
tuipRoutes.get("/:id", authMiddleware, getTuip);
tuipRoutes.post("/", authMiddleware, createTuip);
tuipRoutes.post("/like/:id", authMiddleware, setLike);
tuipRoutes.delete("/like/:id", authMiddleware, removeLike);

export { tuipRoutes };
