export interface BrandConfig {
  id: string;
  name: string;
  aliases: string[];
  productLines: string[];
  color: string;
}

export interface CompetitorConfig {
  id: string;
  name: string;
  aliases: string[];
  color: string;
}

export interface DataSourceConfig {
  weibo: boolean;
  shortVideo: boolean;
  news: boolean;
  forum: boolean;
}

export interface AppConfig {
  brand: BrandConfig;
  competitors: CompetitorConfig[];
  dataSources: DataSourceConfig;
  createdAt: number;
  updatedAt: number;
}

export interface VolumeDataPoint {
  date: string;
  timestamp: number;
  total: number;
  weibo: number;
  shortVideo: number;
  news: number;
  forum: number;
}

export interface BrandVolumeData {
  brandId: string;
  brandName: string;
  color: string;
  data: VolumeDataPoint[];
}

export interface ShareData {
  brandId: string;
  brandName: string;
  color: string;
  totalVolume: number;
  share: number;
  growth: number;
  platformBreakdown: {
    platform: string;
    volume: number;
    share: number;
    growth: number;
  }[];
}

export interface PlatformGrowth {
  platform: string;
  platformName: string;
  growthRate: number;
  currentVolume: number;
  previousVolume: number;
  trend: 'up' | 'down' | 'stable';
}

export interface PostContent {
  id: string;
  title: string;
  content: string;
  author: string;
  authorAvatar: string;
  platform: string;
  publishTime: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  url: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  isAd: boolean;
}

export type TimeRange = 'yesterday' | '7days' | 'custom';

export interface DateRange {
  start: string;
  end: string;
}

export interface Platform {
  key: string;
  name: string;
  icon: string;
  color: string;
}

export const PLATFORMS: Platform[] = [
  { key: 'weibo', name: '微博', icon: 'MessageCircle', color: '#E6162D' },
  { key: 'shortVideo', name: '短视频', icon: 'PlayCircle', color: '#000000' },
  { key: 'news', name: '新闻', icon: 'Newspaper', color: '#1E40AF' },
  { key: 'forum', name: '论坛', icon: 'Users', color: '#7C3AED' },
];

export interface AbnormalSpike {
  id: string;
  brandId: string;
  brandName: string;
  brandColor: string;
  platform: string;
  platformName: string;
  date: string;
  volume: number;
  previousVolume: number;
  growthRate: number;
  severity: 'high' | 'medium' | 'low';
  representativePosts: PostContent[];
}

export type SortField = 'engagement' | 'date' | 'likes' | 'comments' | 'shares';
export type SortOrder = 'desc' | 'asc';

export const COMPETITOR_COLORS = [
  '#8B5CF6',
  '#F97316',
  '#06B6D4',
];
