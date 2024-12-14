import { Router } from "express";
import { getTuip, createTuip } from "../controllers/tuipController.js";

const tuipRoutes = Router();

tuipRoutes.get("/:id", getTuip);
tuipRoutes.post("/", createTuip);

export { tuipRoutes }