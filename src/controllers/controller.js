import { query } from "../db.js";
import dayjs from "dayjs";
import { dateRule } from "../utils/Shared.js";
import {
  getDataResDb,
  getCategoryTypeDb,
  insertAddDataDb,
  deleteDataDb,
  getSumDataDb,
  updateDataDb,
} from "../repository/repository.js";
import { addLogic, getDataLogic } from "../service/service.js";

export const getData = async (req, res) => {
  const { start, end } = req.query;
  const { result, sumData, categoryType } = await getDataLogic(start, end);

  res.json({
    dataSet: result,
    sumData: sumData,
    categoryObj: categoryType,
    state: true,
    message: "資料取得成功",
  });
};

export const AddData = async (req, res) => {
  const { category, amount, description, type, date } = req.body || {};
  const result = await addLogic(category, amount, description, type, date);

  res.status(201).json({
    dataSet: result,
    state: true,
    message: "資料取得成功",
  });
};

export const deleteData = async (req, res) => {
  const { id } = req.params;
  const result = await deleteDataDb(id);

  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "找不到資料",
      state: false,
    });
  }

  res.status(200).json({
    message: "資料刪除成功",
    state: "true",
    data: result,
  });
};

export const updateData = async (req, res) => {
  let { key, value } = req.body;
  const { id } = req.params;

  const allowedMap = {
    category: "category",
    amount: "amount",
    description: "description",
    type: "type",
    date: "date",
  };

  const errorMap = {
    category: "項目",
    amount: "金額",
    description: "標籤",
    type: "類型",
    date: "日期",
  };
  const allowed = allowedMap[key];
  const errorMessage = errorMap[key];
  if (!allowed) {
    return res.status(400).json({ error: "欄位異常" });
  }

  if (typeof value === "string" && !value.trim()) {
    return res.status(400).json({ error: `請填寫完整${errorMessage}` });
  }

  if (allowed == "amount") {
    const num = +value;
    if (Number.isNaN(num) || num <= 0) {
      return res.status(400).json({ error: "請填寫正確金額" });
    }
    value = num;
  }

  if (allowed == "date") {
    if (dateRule(value)) {
      return res.status(400).json({ error: "請填寫正確日期" });
    }

    value = dayjs(value).format("YYYY-MM-DD");
  }

  const result = await updateDataDb(allowed, value, id);

  if (result.rowCount === 0) {
    return res.status(404).json({
      error: "找不到資料，更新失敗",
    });
  }

  res.status(200).json({
    message: "更新成功",
    state: true,
  });
};
