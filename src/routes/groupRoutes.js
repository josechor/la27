import { Router } from "express";
import { getGroups,
    getGroup,
    createGroup,
    updateGroup
} from "../controllers/groupController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const groupRoutes = Router();

groupRoutes.get("/", authMiddleware, getGroups);
groupRoutes.get("/:id", authMiddleware, getGroup);
groupRoutes.post("/", authMiddleware, createGroup);
groupRoutes.patch("/:id", authMiddleware, updateGroup);

export { groupRoutes };
