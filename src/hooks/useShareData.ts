import { useMemo } from 'react';
import { useVolumeData } from './useVolumeData';
import { generateShareData, generatePlatformGrowth, getTopGrowthPlatforms, getDecliningPlatforms } from '@/services/mockData/shareGenerator';
import { PLATFORMS, Platform } from '@/types';
import { useAppStore } from '@/store/appStore';

export const useShareData = () => {
  const { currentData, previousData, currentRange, enabledPlatforms } = useVolumeData();
  const { config } = useAppStore();
  
  const enabledPlatformList = useMemo(() => {
    if (!config) return PLATFORMS;
    return PLATFORMS.filter(p => config.dataSources[p.key as keyof typeof config.dataSources]);
  }, [config]);
  
  const shareData = useMemo(() => {
    return generateShareData(currentData, enabledPlatforms);
  }, [currentData, enabledPlatforms]);
  
  const platformGrowth = useMemo(() => {
    return generatePlatformGrowth(currentData, previousData, enabledPlatformList);
  }, [currentData, previousData, enabledPlatformList]);
  
  const topGrowthPlatforms = useMemo(() => {
    return getTopGrowthPlatforms(platformGrowth, 3);
  }, [platformGrowth]);
  
  const decliningPlatforms = useMemo(() => {
    return getDecliningPlatforms(platformGrowth, 3);
  }, [platformGrowth]);
  
  const sortedBrandsByShare = useMemo(() => {
    return [...shareData].sort((a, b) => b.share - a.share);
  }, [shareData]);
  
  const brandRanking = useMemo(() => {
    return sortedBrandsByShare.map((brand, index) => ({
      ...brand,
      rank: index + 1,
    }));
  }, [sortedBrandsByShare]);
  
  return {
    shareData,
    platformGrowth,
    topGrowthPlatforms,
    decliningPlatforms,
    sortedBrandsByShare,
    brandRanking,
    currentRange,
    enabledPlatforms,
    enabledPlatformList,
  };
};
