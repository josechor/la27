import express, { json } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { multimediaRoutes } from "./routes/multimedia.js";
import { userRoutes } from "./modules/la27/routes/userRoutes.js";
import { tuipRoutes } from "./modules/la27/routes/tuipRoutes.js";
import { groupRoutes } from "./modules/la27/routes/groupRoutes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(json());
app.use(cors({ origin: "*" }));

app.use('/multimedia', express.static(path.join(__dirname, '../uploads')));
app.use("/api/users", userRoutes);
app.use("/api/tuips", tuipRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/multimedia", multimediaRoutes)


export { app };
