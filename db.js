import mysql from "mysql2";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Bb0955059329@",
  database: "run_sql",
});
export default db;
