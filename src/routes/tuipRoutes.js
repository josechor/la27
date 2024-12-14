import { Router } from "express";
import { getTuip, createTuip, getTuips } from "../controllers/tuipController.js";

const tuipRoutes = Router();

tuipRoutes.get("/", getTuips)
tuipRoutes.get("/:id", getTuip);
tuipRoutes.post("/", createTuip);

export { tuipRoutes }