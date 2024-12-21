import { Router } from "express";
import {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  followGroup,
  unfollowGroup,
  getGroupFollowers,
} from "../controllers/groupController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multerMiddleware.js";

const groupRoutes = Router();

groupRoutes.get("/", authMiddleware, getGroups);
groupRoutes.get("/:id", authMiddleware, getGroup);
groupRoutes.get("/:id/followers", authMiddleware, getGroupFollowers);
groupRoutes.post(
  "/",
  authMiddleware,
  upload.array("sectaPicture", 1),
  createGroup
);
groupRoutes.post("/follow/:id", authMiddleware, followGroup);
groupRoutes.delete("/follow/:id", authMiddleware, unfollowGroup);
groupRoutes.patch("/:id", authMiddleware, updateGroup);

export { groupRoutes };
