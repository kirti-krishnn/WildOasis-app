export function subtractDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() - days);

  return nextDate;
}
