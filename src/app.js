import express, { json } from "express";
import { userRoutes } from "./routes/userRoutes.js";
import { tuipRoutes } from "./routes/tuipRoutes.js";
import cors from "cors";

const app = express();

app.use(json());
app.use(cors({ origin: "*" }));

app.use("/api/users", userRoutes);
app.use("/api/tuips", tuipRoutes);

export { app };
