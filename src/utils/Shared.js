import dayjs from "dayjs";
import { AppError } from "../error";

export const dateRule = (day) => {
  return (
    typeof day !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(day) ||
    !dayjs(day, "YYYY-MM-DD", true).isValid()
  );
};

export const LoginRule = (account, password) => {
  if (!account?.trim() || !password?.trim())
    throw new AppError("請填寫完整資料", 400);
};
