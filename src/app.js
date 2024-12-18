import express, { json } from "express";
import { userRoutes } from "./routes/userRoutes.js";
import { tuipRoutes } from "./routes/tuipRoutes.js";
import { groupRoutes } from "./routes/groupRoutes.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(json());
app.use(cors({ origin: "*" }));

app.use('/multimedia', express.static(path.join(__dirname, '../uploads')));
app.use("/api/users", userRoutes);
app.use("/api/tuips", tuipRoutes);
app.use("/api/groups", groupRoutes);

export { app };
