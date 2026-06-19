import { useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import { useVolumeData } from './useVolumeData';
import { generatePostContent } from '@/services/mockData/postGenerator';
import { AbnormalSpike, PLATFORMS, BrandVolumeData, PostContent } from '@/types';
import { generateId } from '@/utils/numberUtils';

const detectSpikesForBrand = (
  brandData: BrandVolumeData,
  platformKeys: string[],
  competitorNames: string[],
  dateRange: { start: string; end: string }
): AbnormalSpike[] => {
  const spikes: AbnormalSpike[] = [];
  const { data, brandId, brandName, color } = brandData;
  
  platformKeys.forEach(platform => {
    const platformInfo = PLATFORMS.find(p => p.key === platform);
    if (!platformInfo) return;
    
    for (let i = 1; i < data.length; i++) {
      const current = data[i];
      const previous = data[i - 1];
      
      if (current.date < dateRange.start || current.date > dateRange.end) continue;
      
      const currentVolume = current[platform as keyof typeof current] as number;
      const previousVolume = previous[platform as keyof typeof previous] as number;
      
      if (previousVolume === 0) continue;
      
      const growthRate = (currentVolume - previousVolume) / previousVolume;
      
      if (growthRate >= 0.5) {
        let severity: 'high' | 'medium' | 'low' = 'low';
        if (growthRate >= 1.5) severity = 'high';
        else if (growthRate >= 0.8) severity = 'medium';
        
        const representativePosts: PostContent[] = generatePostContent(
          brandName,
          competitorNames,
          current.date,
          5
        ).filter(p => p.platform === platform && p.date === current.date).slice(0, 2);
        
        spikes.push({
          id: generateId(),
          brandId,
          brandName,
          brandColor: color,
          platform,
          platformName: platformInfo.name,
          date: current.date,
          volume: currentVolume,
          previousVolume,
          growthRate,
          severity,
          representativePosts,
        });
      }
    }
  });
  
  return spikes;
};

export const useAbnormalSpikes = () => {
  const { config, timeRange, customDateRange } = useAppStore();
  const { allData, enabledPlatforms, currentRange } = useVolumeData();
  
  const isValidCustomRange = timeRange !== 'custom' || (
    customDateRange?.start && 
    customDateRange?.end && 
    customDateRange.start <= customDateRange.end
  );
  
  const effectiveRange = useMemo(() => {
    if (timeRange === 'custom' && isValidCustomRange) {
      return currentRange;
    }
    return currentRange;
  }, [timeRange, isValidCustomRange, currentRange]);
  
  const spikes = useMemo((): AbnormalSpike[] => {
    if (!config || allData.length === 0) return [];
    
    const competitorNames = config.competitors.map(c => c.name);
    const allSpikes: AbnormalSpike[] = [];
    
    allData.forEach(brandData => {
      const brandSpikes = detectSpikesForBrand(
        brandData,
        enabledPlatforms,
        competitorNames,
        effectiveRange
      );
      allSpikes.push(...brandSpikes);
    });
    
    return allSpikes.sort((a, b) => b.growthRate - a.growthRate);
  }, [config, allData, enabledPlatforms, effectiveRange, timeRange, customDateRange]);
  
  const spikesByBrand = useMemo(() => {
    const grouped: Record<string, AbnormalSpike[]> = {};
    spikes.forEach(spike => {
      if (!grouped[spike.brandId]) {
        grouped[spike.brandId] = [];
      }
      grouped[spike.brandId].push(spike);
    });
    return grouped;
  }, [spikes]);
  
  const highSeveritySpikes = useMemo(() => {
    return spikes.filter(s => s.severity === 'high');
  }, [spikes]);
  
  const competitorSpikes = useMemo(() => {
    if (!config) return [];
    return spikes.filter(s => s.brandId !== config.brand.id);
  }, [spikes, config]);
  
  return {
    spikes,
    spikesByBrand,
    highSeveritySpikes,
    competitorSpikes,
    effectiveRange,
    isValidCustomRange,
  };
};
