// @ts-check
import express from "express";
import cors from "cors";
import router from "./routes/router.js";
import { errorHandler } from "./error.js";
const app = express();

// 解析 JSON 格式的請求體
app.use(express.json());
//跨網域設定
app.use(
  cors({
    origin: ["http://localhost:5173", "https://54877.github.io"],
  }),
);

app.use("/api", router);
app.use(errorHandler);
export default app;
