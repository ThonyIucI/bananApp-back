export function getCurrentISOWeek(): { week: number; year: number } {
  const now = new Date();
  const currentDay = new Date(now);
  currentDay.setDate(now.getDate() - ((now.getDay() + 6) % 7) + 3);
  const getFirstDay = new Date(currentDay.getFullYear(), 0, 1);
  if (getFirstDay.getDay() !== 4) {
    getFirstDay.setMonth(0, 1 + ((4 - getFirstDay.getDay() + 7) % 7));
  }
  const week =
    1 + Math.round((currentDay.getTime() - getFirstDay.getTime()) / 604800000);
  return { week, year: currentDay.getFullYear() };
}

export function getISOWeek(date: Date): { week: number; year: number } {
  const currentDay = new Date(date);
  currentDay.setDate(date.getDate() - ((date.getDay() + 6) % 7) + 3);
  const getFirstDay = new Date(currentDay.getFullYear(), 0, 1);
  if (getFirstDay.getDay() !== 4) {
    getFirstDay.setMonth(0, 1 + ((4 - getFirstDay.getDay() + 7) % 7));
  }
  const week =
    1 + Math.round((currentDay.getTime() - getFirstDay.getTime()) / 604800000);
  return { week, year: currentDay.getFullYear() };
}
