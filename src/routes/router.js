import express from "express";
import {
  AddData,
  deleteData,
  getData,
  updateData,
} from "../controllers/controller.js";
//TODO 不易擴充
//TODO 邏輯不清晰
//TODO 規則不夠集中
//TODO 做JAVA SPRING版
const router = express.Router();

// 取得所有支出紀錄
router.get("/expenses", getData);

//新增紀錄
router.post("/AddData", AddData);

//刪除紀錄
router.delete(`/deleteData/:id`, deleteData);

//編輯記錄
router.put(`/update/:id`, updateData);

export default router;
