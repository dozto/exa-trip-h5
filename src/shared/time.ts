export const formatDateLabel = (date: string): string => {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    weekday: "short"
  }).format(parsed);
};

export const formatDuration = (durationMinutes: number): string => {
  if (durationMinutes < 60) {
    return `${durationMinutes} 分钟`;
  }

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  if (!minutes) {
    return `${hours} 小时`;
  }

  return `${hours} 小时 ${minutes} 分钟`;
};
