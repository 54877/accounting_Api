import dayjs from "dayjs";
import { dateRule } from "../utils/Shared.js";
import {
  getCategoryTypeDb,
  getDataResDb,
  getSumDataDb,
  insertAddDataDb,
} from "../repository/repository.js";
import { AppError } from "../error.js";

export const getDataLogic = async (start, end) => {
  start = start === "" ? undefined : start;
  end = end === "" ? undefined : end;

  const now = dayjs();
  if (!start && !end) {
    start = now.startOf("month").format("YYYY-MM-DD");
    end = now.format("YYYY-MM-DD");
  } else if (start && !end) {
    end = now.format("YYYY-MM-DD");
  } else if (!start && end) {
    start = now.startOf("month").format("YYYY-MM-DD");
  }

  if (dateRule(start)) throw new AppError("請填寫正確的開始日期", 400);
  if (dateRule(end)) throw new AppError("請填寫正確的結束日期", 400);
  if (start && end && dayjs(start).isAfter(dayjs(end)))
    throw new AppError("開始日期不能大於結束日期", 400);

  const result = await getDataResDb(start, end);
  const sumData = await getSumDataDb(start, end);
  const categoryType = await getCategoryTypeDb(start, end);
  return { result, sumData, categoryType };
};

export const addLogic = async (category, amount, description, type, date) => {
  if (!category?.trim() || !amount?.trim() || !description?.trim())
    throw new AppError("請填寫完整資料", 400);
  const num = +amount;

  if (Number.isNaN(num) || num <= 0) throw new AppError("請填寫正確金額", 400);

  if (dateRule(date)) throw new AppError("請填寫正確日期", 400);

  const formattedDate = dayjs(date).format("YYYY-MM-DD");
  const result = await insertAddDataDb(
    category,
    amount,
    description,
    type,
    formattedDate,
  );
  return result;
};
