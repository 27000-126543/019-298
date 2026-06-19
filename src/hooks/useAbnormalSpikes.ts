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
        
        const allPostsForDay = generatePostContent(
          brandName,
          competitorNames,
          current.date,
          20
        ).filter(p => p.platform === platform && p.date === current.date);
        
        const representativePosts = allPostsForDay.slice(0, 2);
        
        const organicCount = allPostsForDay.filter(p => !p.isAd).length;
        const adCount = allPostsForDay.filter(p => p.isAd).length;
        const sentiment = {
          positive: allPostsForDay.filter(p => p.sentiment === 'positive').length,
          negative: allPostsForDay.filter(p => p.sentiment === 'negative').length,
          neutral: allPostsForDay.filter(p => p.sentiment === 'neutral').length,
        };
        const totalEngagement = allPostsForDay.reduce((sum, p) => 
          sum + p.engagement.likes + p.engagement.comments + p.engagement.shares, 0);
        const avgLikes = allPostsForDay.length > 0 
          ? Math.round(allPostsForDay.reduce((sum, p) => sum + p.engagement.likes, 0) / allPostsForDay.length)
          : 0;
        const avgComments = allPostsForDay.length > 0
          ? Math.round(allPostsForDay.reduce((sum, p) => sum + p.engagement.comments, 0) / allPostsForDay.length)
          : 0;
        const avgShares = allPostsForDay.length > 0
          ? Math.round(allPostsForDay.reduce((sum, p) => sum + p.engagement.shares, 0) / allPostsForDay.length)
          : 0;
        
        const drivers: string[] = [];
        if (adCount > allPostsForDay.length * 0.4) drivers.push('推广投放');
        if (sentiment.positive > allPostsForDay.length * 0.6) drivers.push('正面讨论');
        if (sentiment.negative > allPostsForDay.length * 0.3) drivers.push('负面争议');
        if (avgLikes > 1000 || avgShares > 100) drivers.push('高互动传播');
        if (organicCount > allPostsForDay.length * 0.7) drivers.push('自然讨论热度');
        if (drivers.length === 0) drivers.push('综合因素');
        
        const attribution = {
          totalPosts: allPostsForDay.length,
          organicCount,
          adCount,
          sentiment,
          engagement: {
            total: totalEngagement,
            avgLikes,
            avgComments,
            avgShares,
          },
          topDrivers: drivers,
        };
        
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
          attribution,
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
