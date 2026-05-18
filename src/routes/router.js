import express from "express";
import {
  AddData,
  deleteData,
  getData,
  updateData,
} from "../controllers/controller.js";
import { authMiddleware } from "../mIddleware/auth.js";

export const router = express.Router();

router.use(authMiddleware);

// 取得所有支出紀錄
router.get("/expenses", getData);

//新增紀錄
router.post("/AddData", AddData);

//刪除紀錄
router.delete(`/deleteData/:id`, deleteData);

//編輯記錄
router.put(`/update/:id`, updateData);
