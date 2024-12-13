import express, { json } from "express";
import { userRoutes } from "./routes/userRoutes.js";
import cors from "cors";

const app = express();

app.use(json());
app.use(cors({ origin: "*" }));

app.use("/api/users", userRoutes);

export { app };
