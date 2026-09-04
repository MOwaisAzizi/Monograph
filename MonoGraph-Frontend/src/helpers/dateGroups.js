const startOfDay = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

export const dayLabel = (value) => {
  const date = startOfDay(value);
  if (!date) return 'Unknown date';
  const today = startOfDay(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.getTime() === today.getTime()) return 'Today';
  if (date.getTime() === yesterday.getTime()) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

// Keeps the original ordering inside each day while providing stable SectionList data.
export const groupByDay = (items, dateField) => {
  const groups = new Map();
  items.forEach((item) => {
    const value = typeof dateField === 'function' ? dateField(item) : item?.[dateField];
    const date = startOfDay(value);
    const key = date ? date.toISOString().slice(0, 10) : 'unknown';
    if (!groups.has(key)) groups.set(key, { title: dayLabel(value), data: [] });
    groups.get(key).data.push(item);
  });
  return [...groups.values()];
};
