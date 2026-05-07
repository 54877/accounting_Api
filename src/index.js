import { query } from "./db.js";
import express from "express";
import cors from "cors";
import dayjs from "dayjs";
import app from "./app.js";

//TODO 不易擴充
//TODO 邏輯不清晰
//TODO 規則不夠集中
//TODO 做JAVA SPRING版

const dateRule = (day) => {
  return (
    typeof day !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(day) ||
    !dayjs(day, "YYYY-MM-DD", true).isValid()
  );
};
// 取得所有支出紀錄
app.get("/api/expenses", async (req, res) => {
  try {
    let { start, end } = req.query;
    const now = dayjs();
    start = start === "" ? undefined : start;
    end = end === "" ? undefined : end;
    if (!start && !end) {
      start = now.startOf("month").format("YYYY-MM-DD");
      end = now.format("YYYY-MM-DD");
    } else if (start && !end) {
      end = now.format("YYYY-MM-DD");
    } else if (!start && end) {
      start = now.startOf("month").format("YYYY-MM-DD");
    }

    if (dateRule(start)) {
      return res.status(400).json({ error: "請填寫正確的開始日期" });
    }

    if (dateRule(end)) {
      return res.status(400).json({ error: "請填寫正確的結束日期" });
    }

    if (dayjs(start).isAfter(dayjs(end))) {
      return res.status(400).json({ error: "開始日期不能大於結束日期" });
    }
    const result = await query(
      `SELECT * FROM expenses
       WHERE date >= $1 AND date <= $2
       ORDER BY date ASC
      `,
      [start, end],
    );
    const sumData = await query(
      `SELECT 
      SUM(CASE WHEN type='income' THEN amount ELSE 0 END) AS "incomeTotal",
      SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS "expenseTotal",
      SUM(CASE WHEN type='income' THEN amount ELSE -amount END) AS "balance"
      FROM expenses
      WHERE date >= $1 AND date <= $2`,
      [start, end],
    );

    const categoryType = await query(
      `
        SELECT category, SUM(amount) AS total
        FROM expenses
        WHERE type = 'expense' AND date >= $1 AND date <= $2
        GROUP BY category
        `,
      [start, end],
    );
    const categoryObj = Object.fromEntries(
      categoryType.rows.map((item) => [item.category, Number(item.total)]),
    );

    res.json({
      dataSet: result.rows,
      sumData: sumData.rows[0],
      categoryObj: categoryObj,
      state: true,
      message: "資料取得成功",
    });
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
      state: true,
      message: "資料取得成功",
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
    let { key, value } = req.body;
    const { id } = req.params;

    const allowedMap = {
      category: "category",
      amount: "amount",
      description: "description",
      type: "type",
      date: "date",
    };

    const errorMap = {
      category: "項目",
      amount: "金額",
      description: "標籤",
      type: "類型",
      date: "日期",
    };
    const allowed = allowedMap[key];
    const errorMessage = errorMap[key];
    if (!allowed) {
      return res.status(400).json({ error: "欄位異常" });
    }

    if (typeof value === "string" && !value.trim()) {
      return res.status(400).json({ error: `請填寫完整${errorMessage}` });
    }

    if (allowed == "amount") {
      const num = +value;
      if (Number.isNaN(num) || num <= 0) {
        return res.status(400).json({ error: "請填寫正確金額" });
      }
      value = num;
    }

    if (allowed == "date") {
      if (dateRule(value)) {
        return res.status(400).json({ error: "請填寫正確日期" });
      }

      value = dayjs(value).format("YYYY-MM-DD");
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
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "資料庫連線失敗",
    });
  }
});
