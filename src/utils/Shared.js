import dayjs from "dayjs";

export const dateRule = (day) => {
  return (
    typeof day !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(day) ||
    !dayjs(day, "YYYY-MM-DD", true).isValid()
  );
};
