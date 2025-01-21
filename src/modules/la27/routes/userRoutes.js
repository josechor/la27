import { Router } from "express";
import {
  getUser,
  getFollowers,
  getFollowing,
  authUser,
  createUser,
  updateUser,
  getSelfData,
  followUser,
  unfollowUser,
  searchUsers,
  getSectasFollowed,
  updateProfilePicture,
  updateBanner,
} from "../controllers/userController.js";
import authMiddleware from "../../../middlewares/authMiddleware.js";
import multer from "multer";
const uploadMulter = multer({ dest: "uploads/" });

const userRoutes = Router();

userRoutes.get("/userData", authMiddleware, getSelfData);
userRoutes.get("/search", authMiddleware, searchUsers);
userRoutes.get("/followedSectas", authMiddleware, getSectasFollowed);
userRoutes.get("/:username", authMiddleware, getUser);
userRoutes.get("/:username/followers", getFollowers);
userRoutes.get("/:username/following", getFollowing);
userRoutes.post("/auth", authUser);
userRoutes.post("/", createUser);
userRoutes.post("/follow/:username", authMiddleware, followUser);
userRoutes.delete("/follow/:username", authMiddleware, unfollowUser);
userRoutes.patch("/update", authMiddleware, updateUser);
userRoutes.patch(
  "/update/picture",
  authMiddleware,
  uploadMulter.single("profilePicture"),
  updateProfilePicture
);
userRoutes.patch(
  "/update/banner",
  authMiddleware,
  uploadMulter.single("banner"),
  updateBanner
);

export { userRoutes };
