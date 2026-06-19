import { VolumeDataPoint, BrandVolumeData, BrandConfig, CompetitorConfig, DataSourceConfig } from '@/types';
import { formatDate, getDaysInRange } from '@/utils/dateUtils';

const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const getPlatformWeight = (platform: string): number => {
  const weights: Record<string, number> = {
    weibo: 0.35,
    shortVideo: 0.4,
    news: 0.15,
    forum: 0.1,
  };
  return weights[platform] || 0.25;
};

const generateDayVolume = (
  date: string,
  baseVolume: number,
  isWeekend: boolean,
  hasPeak: boolean,
  seed: number
): VolumeDataPoint => {
  const dateObj = new Date(date);
  const timestamp = dateObj.getTime();
  
  const weekendFactor = isWeekend ? 0.8 : 1;
  const peakFactor = hasPeak ? 2.5 + seededRandom(seed + 100) * 1.5 : 1;
  const randomFactor = 0.7 + seededRandom(seed + 200) * 0.6;
  
  const total = Math.round(baseVolume * weekendFactor * peakFactor * randomFactor);
  
  const platforms = ['weibo', 'shortVideo', 'news', 'forum'];
  const platformVolumes: Record<string, number> = {};
  
  let remaining = total;
  platforms.forEach((platform, i) => {
    if (i === platforms.length - 1) {
      platformVolumes[platform] = remaining;
    } else {
      const weight = getPlatformWeight(platform);
      const variance = 0.8 + seededRandom(seed + 300 + i) * 0.4;
      const vol = Math.round(total * weight * variance);
      platformVolumes[platform] = Math.min(vol, remaining);
      remaining -= platformVolumes[platform];
    }
  });
  
  return {
    date,
    timestamp,
    total,
    weibo: platformVolumes.weibo,
    shortVideo: platformVolumes.shortVideo,
    news: platformVolumes.news,
    forum: platformVolumes.forum,
  };
};

export const generateVolumeData = (
  brandId: string,
  brandName: string,
  color: string,
  startDate: string,
  endDate: string,
  baseVolume: number,
  seed: number
): BrandVolumeData => {
  const days = getDaysInRange(startDate, endDate);
  const data: VolumeDataPoint[] = [];
  
  days.forEach((date, index) => {
    const dateObj = new Date(date);
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
    const peakPositions = [7, 15, 22];
    const hasPeak = peakPositions.includes(index);
    
    data.push(generateDayVolume(
      date,
      baseVolume,
      isWeekend,
      hasPeak,
      seed + index * 17
    ));
  });
  
  return {
    brandId,
    brandName,
    color,
    data,
  };
};

export const generateAllBrandVolumes = (
  brand: BrandConfig,
  competitors: CompetitorConfig[],
  dataSources: DataSourceConfig,
  days = 30
): BrandVolumeData[] => {
  const end = new Date();
  end.setDate(end.getDate() - 1);
  const start = new Date();
  start.setDate(start.getDate() - days);
  
  const startDate = formatDate(start);
  const endDate = formatDate(end);
  
  const result: BrandVolumeData[] = [];
  
  result.push(generateVolumeData(
    brand.id,
    brand.name,
    brand.color,
    startDate,
    endDate,
    50000,
    42
  ));
  
  const competitorBases = [45000, 38000, 32000];
  competitors.forEach((competitor, index) => {
    result.push(generateVolumeData(
      competitor.id,
      competitor.name,
      competitor.color,
      startDate,
      endDate,
      competitorBases[index] || 30000,
      42 + (index + 1) * 100
    ));
  });
  
  return result;
};

export const getVolumeDataByRange = (
  allData: BrandVolumeData[],
  startDate: string,
  endDate: string
): BrandVolumeData[] => {
  return allData.map(brandData => ({
    ...brandData,
    data: brandData.data.filter(d => d.date >= startDate && d.date <= endDate),
  }));
};

export const calculateTotalVolume = (data: VolumeDataPoint[]): number => {
  return data.reduce((sum, d) => sum + d.total, 0);
};

export const calculateGrowthRate = (
  currentData: VolumeDataPoint[],
  previousData: VolumeDataPoint[]
): number => {
  const currentTotal = calculateTotalVolume(currentData);
  const previousTotal = calculateTotalVolume(previousData);
  
  if (previousTotal === 0) return 0;
  return (currentTotal - previousTotal) / previousTotal;
};
