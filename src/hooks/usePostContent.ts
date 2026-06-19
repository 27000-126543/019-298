import { useMemo, useState, useCallback } from 'react';
import { useAppStore } from '@/store/appStore';
import { generatePostContent } from '@/services/mockData/postGenerator';
import { PostContent, SortField, SortOrder, PLATFORMS } from '@/types';

export const usePostContent = () => {
  const { config, selectedDate } = useAppStore();
  
  const enabledPlatforms = useMemo(() => {
    if (!config) return PLATFORMS.map(p => p.key);
    return PLATFORMS.filter(p => config.dataSources[p.key as keyof typeof config.dataSources]).map(p => p.key);
  }, [config]);
  
  const allPosts = useMemo((): PostContent[] => {
    if (!config || !selectedDate) return [];
    
    const competitorNames = config.competitors.map(c => c.name);
    const posts = generatePostContent(config.brand.name, competitorNames, selectedDate, 15);
    
    return posts.filter(p => enabledPlatforms.includes(p.platform));
  }, [config, selectedDate, enabledPlatforms]);
  
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'ad' | 'organic'>('all');
  const [sortField, setSortField] = useState<SortField>('engagement');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  const getTotalEngagement = (post: PostContent) => {
    return post.engagement.likes + post.engagement.comments + post.engagement.shares;
  };
  
  const filteredPosts = useMemo(() => {
    let result = [...allPosts];
    
    if (platformFilter !== 'all') {
      result = result.filter(p => p.platform === platformFilter);
    }
    
    if (sentimentFilter !== 'all') {
      result = result.filter(p => p.sentiment === sentimentFilter);
    }
    
    if (typeFilter === 'ad') {
      result = result.filter(p => p.isAd);
    } else if (typeFilter === 'organic') {
      result = result.filter(p => !p.isAd);
    }
    
    result.sort((a, b) => {
      let valueA: number;
      let valueB: number;
      
      switch (sortField) {
        case 'date':
          valueA = a.publishTime;
          valueB = b.publishTime;
          break;
        case 'likes':
          valueA = a.engagement.likes;
          valueB = b.engagement.likes;
          break;
        case 'comments':
          valueA = a.engagement.comments;
          valueB = b.engagement.comments;
          break;
        case 'shares':
          valueA = a.engagement.shares;
          valueB = b.engagement.shares;
          break;
        case 'engagement':
        default:
          valueA = getTotalEngagement(a);
          valueB = getTotalEngagement(b);
          break;
      }
      
      return sortOrder === 'desc' ? valueB - valueA : valueA - valueB;
    });
    
    return result;
  }, [allPosts, platformFilter, sentimentFilter, typeFilter, sortField, sortOrder]);
  
  const postsBySentiment = useMemo(() => {
    const positive = allPosts.filter(p => p.sentiment === 'positive');
    const negative = allPosts.filter(p => p.sentiment === 'negative');
    const neutral = allPosts.filter(p => p.sentiment === 'neutral');
    return { positive, negative, neutral };
  }, [allPosts]);
  
  const adPosts = useMemo(() => {
    return allPosts.filter(p => p.isAd);
  }, [allPosts]);
  
  const organicPosts = useMemo(() => {
    return allPosts.filter(p => !p.isAd);
  }, [allPosts]);
  
  const getSentimentLabel = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return { text: '正面', color: 'bg-success-50 text-success-600' };
      case 'negative': return { text: '负面', color: 'bg-danger-50 text-danger-600' };
      default: return { text: '中性', color: 'bg-dark-100 text-dark-600' };
    }
  };
  
  const toggleSortOrder = useCallback(() => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  }, []);
  
  const resetFilters = useCallback(() => {
    setPlatformFilter('all');
    setSentimentFilter('all');
    setTypeFilter('all');
    setSortField('engagement');
    setSortOrder('desc');
  }, []);
  
  return {
    posts: allPosts,
    filteredPosts,
    postsBySentiment,
    adPosts,
    organicPosts,
    getSentimentLabel,
    getTotalEngagement,
    selectedDate,
    enabledPlatforms,
    platformFilter,
    setPlatformFilter,
    sentimentFilter,
    setSentimentFilter,
    typeFilter,
    setTypeFilter,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    toggleSortOrder,
    resetFilters,
  };
};
