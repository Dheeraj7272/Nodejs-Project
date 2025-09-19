import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Import Routes
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.route.js";

app.use("/api/v1/users", userRouter);
app.use("/app/v1/videos", videoRouter);
export default app;
