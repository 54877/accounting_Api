import app from "./app.js";

// 啟動伺服器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`伺服器已啟動：http://localhost:${PORT}`);
});
