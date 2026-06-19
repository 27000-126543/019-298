import { useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import { generateAllBrandVolumes, getVolumeDataByRange, calculateTotalVolume, calculateGrowthRate } from '@/services/mockData/volumeGenerator';
import { getDateRange } from '@/utils/dateUtils';
import { BrandVolumeData } from '@/types';

export const useVolumeData = () => {
  const { config, timeRange, customDateRange } = useAppStore();
  
  const allData = useMemo(() => {
    if (!config) return [];
    return generateAllBrandVolumes(config.brand, config.competitors, config.dataSources, 30);
  }, [config]);
  
  const currentRange = useMemo(() => {
    return getDateRange(timeRange, customDateRange || undefined);
  }, [timeRange, customDateRange]);
  
  const previousRange = useMemo(() => {
    const start = new Date(currentRange.start);
    const end = new Date(currentRange.end);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - days);
    
    return {
      start: prevStart.toISOString().split('T')[0],
      end: prevEnd.toISOString().split('T')[0],
    };
  }, [currentRange]);
  
  const currentData = useMemo(() => {
    return getVolumeDataByRange(allData, currentRange.start, currentRange.end);
  }, [allData, currentRange]);
  
  const previousData = useMemo(() => {
    return getVolumeDataByRange(allData, previousRange.start, previousRange.end);
  }, [allData, previousRange]);
  
  const brandData = useMemo(() => {
    return currentData[0] || null;
  }, [currentData]);
  
  const competitorData = useMemo(() => {
    return currentData.slice(1);
  }, [currentData]);
  
  const getBrandTotalVolume = (brandData: BrandVolumeData) => {
    return calculateTotalVolume(brandData.data);
  };
  
  const getBrandGrowthRate = (current: BrandVolumeData, previous: BrandVolumeData) => {
    return calculateGrowthRate(current.data, previous.data);
  };
  
  const getPlatformVolume = (brandData: BrandVolumeData, platform: string) => {
    return brandData.data.reduce((sum, d) => {
      return sum + (d[platform as keyof typeof d] as number);
    }, 0);
  };
  
  return {
    allData,
    currentData,
    previousData,
    currentRange,
    previousRange,
    brandData,
    competitorData,
    getBrandTotalVolume,
    getBrandGrowthRate,
    getPlatformVolume,
  };
};
