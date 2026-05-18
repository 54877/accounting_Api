import dotenv from "dotenv";
import app from "./app.js";
// 啟動伺服器
dotenv.config();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`伺服器已啟動：http://localhost:${PORT}`);
});
