import { query } from "../db.js";
import dayjs from "dayjs";

export const getDataResDb = async (start, end) => {
  const res = await query(
    `SELECT * FROM expenses
           WHERE date >= $1 AND date <= $2
           ORDER BY date ASC
          `,
    [start, end],
  );
  return res.rows;
};

export const getSumDataDb = async (start, end) => {
  const res = await query(
    `SELECT 
      SUM(CASE WHEN type='income' THEN amount ELSE 0 END) AS "incomeTotal",
      SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS "expenseTotal",
      SUM(CASE WHEN type='income' THEN amount ELSE -amount END) AS "balance"
      FROM expenses
      WHERE date >= $1 AND date <= $2`,
    [start, end],
  );
  return res.rows[0];
};

export const getCategoryTypeDb = async (start, end) => {
  const res = await query(
    `
        SELECT category, SUM(amount) AS total
        FROM expenses
        WHERE type = 'expense' AND date >= $1 AND date <= $2
        GROUP BY category
        `,
    [start, end],
  );

  return Object.fromEntries(
    res.rows.map((item) => [item.category, Number(item.total)]),
  );
};

export const insertAddDataDb = async (
  category,
  amount,
  description,
  type,
  formatted_date,
) => {
  const res = await query(
    "INSERT INTO expenses (category , amount , description , type , date) VALUES ($1 , $2 , $3 , $4 , $5)  RETURNING *",
    [category, amount, description, type, formatted_date],
  );
  return res.rows[0];
};

export const deleteDataDb = async (id) => {
  const res = await query(
    `DELETE FROM expenses
    WHERE id=$1
      RETURNING *
       `,
    [id],
  );
  return res.rows[0];
};

export const updateDataDb = async (allowed, value, id) => {
  const res = await query(
    `
        UPDATE expenses
        SET
          ${allowed} = $1
        WHERE id = $2
        RETURNING *
      `,
    [value, id],
  );
  return res;
};
