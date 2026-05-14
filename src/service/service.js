import dayjs from "dayjs";
import { dateRule, LoginRule } from "../utils/Shared.js";
import {
  deleteDataDb,
  getCategoryTypeDb,
  getDataResDb,
  getSumDataDb,
  insertAddDataDb,
  loginUserDb,
  registerUserDb,
  updateDataDb,
} from "../repository/repository.js";
import bcrypt from "bcrypt";
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
  if (!category?.trim() || !amount?.trim() || !description?.trim()) {
    throw new AppError("請填寫完整資料", 400);
  }
  const num = +amount;

  if (Number.isNaN(num) || num <= 0) throw new AppError("請填寫正確金額", 400);

  if (dateRule(date)) throw new AppError("請填寫正確日期", 400);

  const formatted_date = dayjs(date).format("YYYY-MM-DD");
  const result = await insertAddDataDb(
    category,
    amount,
    description,
    type,
    formatted_date,
  );
  return result;
};

export const updateLogic = async (key, value, id) => {
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
  console.log("allowed", allowed);
  console.log("errorMessage", errorMessage);
  if (!allowed) throw new AppError("欄位異常", 400);

  if (typeof value === "string" && !value.trim())
    throw new AppError(`請填寫完整${errorMessage}`, 400);

  if (allowed == "amount") {
    const num = +value;
    if (Number.isNaN(num) || num <= 0) {
      throw new AppError(`請填寫正確${errorMessage}`, 400);
    }
    value = num;
  }

  if (allowed == "date") {
    if (dateRule(value)) {
      throw new AppError(`請填寫正確${errorMessage}`, 400);
    }

    value = dayjs(value).format("YYYY-MM-DD");
  }

  const result = await updateDataDb(allowed, value, id);
  if (result.rowCount === 0) {
    throw new AppError("找不到資料，更新失敗", 404);
  }
  return result;
};

export const deleteLogic = async (id) => {
  const result = await deleteDataDb(id);
  if (result.rowCount === 0) {
    throw new AppError("找不到資料，刪除失敗", 404);
  }
  return result;
};

export const registerUserLogic = async (account, password) => {
  const ruler =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
  LoginRule(account, password);

  if (!ruler.test(password) || password.length > 20)
    throw new AppError(
      "密碼需包含至少一個大寫字母、一個小寫字母、一個數字和一個特殊字符，且長度至少為8位且不超過20位",
      400,
    );

  if (account.length > 20 || account.length < 8)
    throw new AppError("帳號長度需介於8到20字元", 400);
  const hashPassword = await bcrypt.hash(password, 10);

  const result = await registerUserDb(account, hashPassword);
  return result;
};

export const loginUserLogin = async (account, password) => {
  LoginRule(account, password);

  const result = await loginUserDb(account, password);
  const user = result.find((e) => e.account == account);

  if (!user) {
    throw new AppError("帳號不存在", 400);
  }
  const psd = await bcrypt.compare(password, user.password);

  if (!psd) {
    throw new AppError("密碼錯誤", 400);
  }

  return result;
};
