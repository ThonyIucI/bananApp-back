export function getCurrentISOWeek(): { week: number; year: number } {
  const now = new Date();
  const thursday = new Date(now);
  thursday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + 3);
  const firstThursday = new Date(thursday.getFullYear(), 0, 1);
  if (firstThursday.getDay() !== 4) {
    firstThursday.setMonth(0, 1 + ((4 - firstThursday.getDay() + 7) % 7));
  }
  const week =
    1 + Math.round((thursday.getTime() - firstThursday.getTime()) / 604800000);
  return { week, year: thursday.getFullYear() };
}

export function getISOWeek(date: Date): { week: number; year: number } {
  const thursday = new Date(date);
  thursday.setDate(date.getDate() - ((date.getDay() + 6) % 7) + 3);
  const firstThursday = new Date(thursday.getFullYear(), 0, 1);
  if (firstThursday.getDay() !== 4) {
    firstThursday.setMonth(0, 1 + ((4 - firstThursday.getDay() + 7) % 7));
  }
  const week =
    1 + Math.round((thursday.getTime() - firstThursday.getTime()) / 604800000);
  return { week, year: thursday.getFullYear() };
}
