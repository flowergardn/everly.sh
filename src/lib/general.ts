import dayjs from "dayjs";

const isNonEmptyString = (str: string | undefined): boolean =>
  typeof str === "string" && str.trim() !== "";

function isPastDate(inputDate: string, currentDate: string) {
  const _currentDate = dayjs(currentDate);
  const targetDate = dayjs(inputDate);

  return targetDate.isBefore(_currentDate);
}

export { isNonEmptyString, isPastDate };
