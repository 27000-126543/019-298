export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateCN = (date: Date): string => {
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

export const parseDate = (dateStr: string): Date => {
  return new Date(dateStr);
};

export const getYesterdayRange = (): { start: string; end: string } => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = formatDate(yesterday);
  return { start: dateStr, end: dateStr };
};

export const getLast7DaysRange = (): { start: string; end: string } => {
  const end = new Date();
  end.setDate(end.getDate() - 1);
  const start = new Date();
  start.setDate(start.getDate() - 7);
  return {
    start: formatDate(start),
    end: formatDate(end),
  };
};

export const getDateRange = (
  range: 'yesterday' | '7days' | 'custom',
  customRange?: { start: string; end: string }
): { start: string; end: string } => {
  if (range === 'yesterday') {
    return getYesterdayRange();
  }
  if (range === '7days') {
    return getLast7DaysRange();
  }
  return customRange || getYesterdayRange();
};

export const getDaysInRange = (start: string, end: string): string[] => {
  const days: string[] = [];
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  
  const current = new Date(startDate);
  while (current <= endDate) {
    days.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }
  
  return days;
};

export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const formatDateTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return `${formatDate(date)} ${formatTime(timestamp)}`;
};

export const getRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return formatDate(new Date(timestamp));
};
