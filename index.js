import { query } from "./db.js";
import express from "express";
import cors from "cors";
import dayjs from "dayjs";

//TODO 不易擴充
//TODO 邏輯不清晰
//TODO 規則不夠集中
//TODO 做JAVA SPRING版
//先把所有功能做出來 再升級最後才做JAVA SPRING

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
    const { category, amount, description, type, date } = req.body;
    if (!category?.trim() || !amount || !description?.trim()) {
      return res.status(400).json({ error: "請填寫完整資料" });
    }
    const num = +amount;
    if (Number.isNaN(num) || num <= 0) {
      return res.status(400).json({ error: "請填寫正確金額" });
    }

    if (
      typeof date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !dayjs(date, "YYYY-MM-DD", true).isValid()
    ) {
      return res.status(400).json({ error: "請填寫正確日期" });
    }
    const formattedDate = dayjs(date).format("YYYY-MM-DD");

    const result = await query(
      "INSERT INTO expenses (category , amount , description , type , date) VALUES ($1 , $2 , $3 , $4 , $5)  RETURNING *",
      [category, amount, description, type, formattedDate],
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

//編輯記錄
app.put(`/api/update/:id`, async (req, res) => {
  try {
    const { key, value } = req.body;
    const { id } = req.params;

    const allowedMap = {
      category: "category",
      amount: "amount",
      description: "description",
      type: "type",
    };
    const allowed = allowedMap[key];

    if (!allowed) {
      return res.status(400).json({ error: "欄位異常" });
    }

    const result = await query(
      `
        UPDATE expenses
        SET
          ${allowed} = $1
        WHERE id = $2
        RETURNING *
      `,
      [value, id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "找不到資料，更新失敗",
      });
    }

    res.status(200).json({
      message: "更新成功",
      state: true,
      data: console.log({
        id,
        key,
        value,
        rowCount: result.rowCount,
        rows: result.rows,
      }),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "資料庫連線失敗",
    });
  }
});

// 啟動伺服器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`伺服器已啟動：http://localhost:${PORT}`);
});
