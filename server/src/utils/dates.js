export const startOfUTCDay = (d = new Date()) => {
  const date = new Date(d);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

export const startOfWeekUTC = (d = new Date()) => {
  const date = startOfUTCDay(d);
  const day = date.getUTCDay();
  const diff = (day + 6) % 7;
  date.setUTCDate(date.getUTCDate() - diff);
  return date;
};

export const addDays = (d, days) => {
  const date = new Date(d);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
};

export const last7Days = (d = new Date()) => {
  const end = startOfUTCDay(d);
  const start = addDays(end, -6);
  return { start, end };
};
