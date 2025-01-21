import { Router } from "express";

const multimediaRoutes = Router();
import multer from "multer";
import { upload } from "../controllers/mediaController.js";
const uploadMulter = multer({ dest: "uploads/" });

multimediaRoutes.post("/upload", uploadMulter.single("file"), upload);

export { multimediaRoutes };
