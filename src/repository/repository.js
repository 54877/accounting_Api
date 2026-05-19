import { query } from "../db.js";
import { AppError } from "../error.js";

export const getDataResDb = async (start, end, user_id) => {
  const res = await query(
    `SELECT * FROM expenses
           WHERE date >= $1 AND date <= $2 AND user_id = $3
           ORDER BY date ASC
          `,
    [start, end, user_id],
  );
  return res.rows;
};

export const getSumDataDb = async (start, end, user_id) => {
  const res = await query(
    `SELECT 
      SUM(CASE WHEN type='income' THEN amount ELSE 0 END) AS "incomeTotal",
      SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS "expenseTotal",
      SUM(CASE WHEN type='income' THEN amount ELSE -amount END) AS "balance"
      FROM expenses
      WHERE date >= $1 AND date <= $2 AND user_id = $3`,
    [start, end, user_id],
  );
  return res.rows[0];
};

export const getCategoryTypeDb = async (start, end, user_id) => {
  const res = await query(
    `
        SELECT category, SUM(amount) AS total
        FROM expenses
        WHERE type = 'expense' AND date >= $1 AND date <= $2 AND user_id = $3
        GROUP BY category
        `,
    [start, end, user_id],
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
  user_id,
) => {
  const res = await query(
    "INSERT INTO expenses (category , amount , description , type , date , user_id) VALUES ($1 , $2 , $3 , $4 , $5 , $6)  RETURNING *",
    [category, amount, description, type, formatted_date, user_id],
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

export const registerUserDb = async (account, password) => {
  try {
    const result = await query(
      `INSERT INTO users_table (account, password) VALUES ($1, $2) RETURNING id , account`,
      [account, password],
    );

    return result.rows[0];
  } catch (err) {
    if (err.code === "23505") throw new AppError("使用者已存在", 400);
  }
};

export const loginUserDb = async (account, password) => {
  const result = await query(
    `
    SELECT * FROM
    users_table
    `,
  );
  return result.rows;
};

export const userDb = async (account) => {
  const result = await query(
    `
    SELECT * FROM
    users_table
    WHERE account =$1
    `,
    [account],
  );

  return result.rows[0];
};
