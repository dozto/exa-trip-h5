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

export const parseTimeToMinutes = (time?: string): number | null => {
  if (!time) {
    return null;
  }
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    return null;
  }
  return hours * 60 + minutes;
};

export const formatMinutesToTime = (minutesInDay: number): string => {
  const clamped = Math.max(0, minutesInDay);
  const hours = Math.floor(clamped / 60).toString().padStart(2, "0");
  const minutes = (clamped % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};
