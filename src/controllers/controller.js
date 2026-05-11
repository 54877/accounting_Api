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

  const result = await updateLogic(key, value, id);
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
