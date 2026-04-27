import { query } from "./db.js";
import express from "express";
import cors from "cors";

const app = express();

// 解析 JSON 格式的請求體
app.use(express.json());
//跨網域設定
app.use(
  cors({
    origin: ["http://localhost:5173", "https://54877.github.io"],
  }),
);

// 測試路由：取得所有支出紀錄
app.get("/api/expenses", async (req, res) => {
  try {
    const result = await query("SELECT * FROM expenses");
    const sumData = await query(`SELECT 
      SUM(CASE WHEN type='income' THEN amount ELSE 0 END) AS "incomeTotal",
      SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS "expenseTotal",
      SUM(CASE WHEN type='income' THEN amount ELSE -amount END) AS "balance"
      FROM expenses`);
    res.json({ dataSet: result.rows, sumData: sumData.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "資料庫連線失敗" });
  }
});

//新增紀錄
app.post("/api/AddData", async (req, res) => {
  try {
    const { category, amount, description, type } = req.body;
    if (!category?.trim() || !amount || !description?.trim()) {
      return res.status(400).json({ error: "請填寫完整資料" });
    }
    const num = +amount;
    if (Number.isNaN(num) || num <= 0) {
      return res.status(400).json({ error: "請填寫正確金額" });
    }
    const result = await query(
      "INSERT INTO expenses (category , amount , description , type) VALUES ($1 , $2 , $3 , $4)  RETURNING *",
      [category, amount, description, type],
    );
    res.status(201).json({
      message: "資料新增成功",
      dataSet: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "資料庫連線失敗" });
  }
});

//刪除紀錄
app.delete(`/api/deleteData/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `DELETE FROM expenses
      WHERE id=$1
      RETURNING *
      `,
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "找不到資料",
        state: false,
      });
    }

    res.status(200).json({
      message: "資料刪除成功",
      state: "true",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "資料庫連接失敗" });
  }
});

// 啟動伺服器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`伺服器已啟動：http://localhost:${PORT}`);
});
