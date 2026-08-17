export const timeAgo = (date) => {
  const days = Math.floor((Date.now() - new Date(date)) / 86400000);
  return days < 1
    ? 'today'
    : days < 30
      ? `${days} days ago`
      : `${Math.floor(days / 30)} months ago`;
};
