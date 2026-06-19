import { useMemo } from 'react';
import { useVolumeData } from './useVolumeData';
import { generateShareData, generatePlatformGrowth, getTopGrowthPlatforms, getDecliningPlatforms } from '@/services/mockData/shareGenerator';
import { PLATFORMS } from '@/types';

export const useShareData = () => {
  const { currentData, previousData, currentRange } = useVolumeData();
  
  const enabledPlatforms = useMemo(() => {
    return PLATFORMS.map(p => p.key);
  }, []);
  
  const shareData = useMemo(() => {
    return generateShareData(currentData, enabledPlatforms);
  }, [currentData, enabledPlatforms]);
  
  const platformGrowth = useMemo(() => {
    return generatePlatformGrowth(currentData, previousData, PLATFORMS);
  }, [currentData, previousData]);
  
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
  };
};
