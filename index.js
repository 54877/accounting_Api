import express from "express";
import db from "./db.js";
import cors from "cors";

const app = express();
app.use(cors());

db.connect((err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log("DB connected successfully");
});

app.get("/table", (req, res) => {
  db.query("SELECT * FROM accounting_table", (err, results) => {
    if (err) {
      res.status(500).json(err);
      return;
    }
    res.json(results);
  });
});

app.listen(3000, () => {
  console.log("server running on port 3000");
});
