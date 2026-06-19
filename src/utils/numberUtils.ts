export const formatNumber = (num: number): string => {
  if (num >= 100000000) {
    return (num / 100000000).toFixed(1) + '亿';
  }
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toLocaleString();
};

export const formatPercent = (num: number, decimals = 1): string => {
  return (num * 100).toFixed(decimals) + '%';
};

export const formatGrowth = (num: number): string => {
  const prefix = num > 0 ? '+' : '';
  return prefix + (num * 100).toFixed(1) + '%';
};

export const getGrowthColor = (growth: number): string => {
  if (growth > 0.1) return 'text-success-500';
  if (growth < -0.1) return 'text-danger-500';
  return 'text-dark-500';
};

export const getGrowthBgColor = (growth: number): string => {
  if (growth > 0.1) return 'bg-success-50 text-success-600';
  if (growth < -0.1) return 'bg-danger-50 text-danger-600';
  return 'bg-dark-100 text-dark-600';
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const roundTo = (num: number, decimals: number): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
};
