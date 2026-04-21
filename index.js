import { query } from "./db.js";
import express from "express";
import cors from "cors";

const app = express();

// 解析 JSON 格式的請求體
app.use(express.json());

//跨網域設定
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

// 測試路由：取得所有支出紀錄
app.get("/api/expenses", async (req, res) => {
  try {
    const result = await query("SELECT * FROM expenses ORDER BY date DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "資料庫連線失敗" });
  }
});

// 啟動伺服器
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`伺服器已啟動：http://localhost:${PORT}`);
});
