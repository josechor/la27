import { Router } from "express";
import {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
} from "../controllers/groupController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multerMiddleware.js";

const groupRoutes = Router();

groupRoutes.get("/", authMiddleware, getGroups);
groupRoutes.get("/:id", authMiddleware, getGroup);
groupRoutes.post(
  "/",
  authMiddleware,
  upload.array("sectaPicture", 1),
  createGroup
);
groupRoutes.patch("/:id", authMiddleware, updateGroup);

export { groupRoutes };
