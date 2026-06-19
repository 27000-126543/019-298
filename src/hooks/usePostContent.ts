import { useMemo, useState, useCallback } from 'react';
import { useAppStore } from '@/store/appStore';
import { generatePostContent } from '@/services/mockData/postGenerator';
import { PostContent } from '@/types';

export const usePostContent = () => {
  const { config, selectedDate } = useAppStore();
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  
  const posts = useMemo((): PostContent[] => {
    if (!config || !selectedDate) return [];
    
    const competitorNames = config.competitors.map(c => c.name);
    return generatePostContent(config.brand.name, competitorNames, selectedDate, 10);
  }, [config, selectedDate]);
  
  const postsBySentiment = useMemo(() => {
    const positive = posts.filter(p => p.sentiment === 'positive');
    const negative = posts.filter(p => p.sentiment === 'negative');
    const neutral = posts.filter(p => p.sentiment === 'neutral');
    return { positive, negative, neutral };
  }, [posts]);
  
  const adPosts = useMemo(() => {
    return posts.filter(p => p.isAd);
  }, [posts]);
  
  const organicPosts = useMemo(() => {
    return posts.filter(p => !p.isAd);
  }, [posts]);
  
  const toggleExpand = useCallback((postId: string) => {
    setExpandedPost(prev => prev === postId ? null : postId);
  }, []);
  
  const getSentimentLabel = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return { text: '正面', color: 'bg-success-50 text-success-600' };
      case 'negative': return { text: '负面', color: 'bg-danger-50 text-danger-600' };
      default: return { text: '中性', color: 'bg-dark-100 text-dark-600' };
    }
  };
  
  return {
    posts,
    postsBySentiment,
    adPosts,
    organicPosts,
    expandedPost,
    toggleExpand,
    getSentimentLabel,
    selectedDate,
  };
};
