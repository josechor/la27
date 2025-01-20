import { Router } from "express";
import { upload } from "../controllers/multimediaController.js";

const multimediaRoutes = Router();
import multer from "multer";
const uploadMulter = multer({ dest: "uploads/" });

multimediaRoutes.post("/upload", uploadMulter.single("file"), upload);

export { multimediaRoutes };
