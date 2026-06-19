import { ShareData, PlatformGrowth, VolumeDataPoint, BrandVolumeData } from '@/types';
import { calculateTotalVolume } from './volumeGenerator';

export const generateShareData = (
  brandVolumes: BrandVolumeData[],
  platformKeys: string[]
): ShareData[] => {
  const totalAll = brandVolumes.reduce((sum, bv) => {
    return sum + calculateTotalVolume(bv.data);
  }, 0);
  
  const platformTotals: Record<string, number> = {};
  platformKeys.forEach(key => {
    platformTotals[key] = brandVolumes.reduce((sum, bv) => {
      return sum + bv.data.reduce((s, d) => s + (d[key as keyof VolumeDataPoint] as number), 0);
    }, 0);
  });
  
  return brandVolumes.map(bv => {
    const brandTotal = calculateTotalVolume(bv.data);
    const share = totalAll > 0 ? brandTotal / totalAll : 0;
    const growth = 0.05 + Math.random() * 0.2 - 0.1;
    
    const platformBreakdown = platformKeys.map(platform => {
      const platformTotal = bv.data.reduce((s, d) => s + (d[platform as keyof VolumeDataPoint] as number), 0);
      const platformShare = platformTotals[platform] > 0 ? platformTotal / platformTotals[platform] : 0;
      const platformGrowth = 0.03 + Math.random() * 0.25 - 0.1;
      
      return {
        platform,
        volume: platformTotal,
        share: platformShare,
        growth: platformGrowth,
      };
    });
    
    return {
      brandId: bv.brandId,
      brandName: bv.brandName,
      color: bv.color,
      totalVolume: brandTotal,
      share,
      growth,
      platformBreakdown,
    };
  });
};

export const generatePlatformGrowth = (
  currentData: BrandVolumeData[],
  previousData: BrandVolumeData[],
  platforms: { key: string; name: string }[]
): PlatformGrowth[] => {
  return platforms.map(platform => {
    const currentTotal = currentData.reduce((sum, bv) => {
      return sum + bv.data.reduce((s, d) => s + (d[platform.key as keyof VolumeDataPoint] as number), 0);
    }, 0);
    
    const previousTotal = previousData.reduce((sum, bv) => {
      return sum + bv.data.reduce((s, d) => s + (d[platform.key as keyof VolumeDataPoint] as number), 0);
    }, 0);
    
    const growthRate = previousTotal > 0 
      ? (currentTotal - previousTotal) / previousTotal 
      : 0;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (growthRate > 0.05) trend = 'up';
    if (growthRate < -0.05) trend = 'down';
    
    return {
      platform: platform.key,
      platformName: platform.name,
      growthRate,
      currentVolume: currentTotal,
      previousVolume: previousTotal,
      trend,
    };
  });
};

export const getTopGrowthPlatforms = (platformGrowth: PlatformGrowth[], limit = 3): PlatformGrowth[] => {
  return [...platformGrowth]
    .filter(p => p.trend === 'up')
    .sort((a, b) => b.growthRate - a.growthRate)
    .slice(0, limit);
};

export const getDecliningPlatforms = (platformGrowth: PlatformGrowth[], limit = 3): PlatformGrowth[] => {
  return [...platformGrowth]
    .filter(p => p.trend === 'down')
    .sort((a, b) => a.growthRate - b.growthRate)
    .slice(0, limit);
};
