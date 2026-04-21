import pkg from "pg";
const { Pool } = pkg;
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  family: 4,
});

export const query = (text, params) => pool.query(text, params);
