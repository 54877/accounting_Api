import express from "express";
import {
  AddData,
  deleteData,
  getData,
  registerUser,
  updateData,
} from "../controllers/controller.js";

const router = express.Router();

// 取得所有支出紀錄
router.get("/expenses", getData);

//新增紀錄
router.post("/AddData", AddData);

//刪除紀錄
router.delete(`/deleteData/:id`, deleteData);

//編輯記錄
router.put(`/update/:id`, updateData);

//註冊帳號
router.post("/register", registerUser);

export default router;
