import { useState } from 'react';
import { TrendingUp, AlertTriangle, ChevronDown, ChevronUp, Calendar, ExternalLink, BarChart3 } from 'lucide-react';
import { AbnormalSpike, PostContent } from '@/types';
import { PostCard } from './PostCard';
import { formatNumber, formatPercent } from '@/utils/numberUtils';
import { cn } from '@/lib/utils';

interface AbnormalSpikeCardProps {
  spike: AbnormalSpike;
  getSentimentLabel: (sentiment: string) => { text: string; color: string };
  onViewMore?: (spike: AbnormalSpike) => void;
  delay?: number;
}

export const AbnormalSpikeCard = ({ spike, getSentimentLabel, onViewMore, delay = 0 }: AbnormalSpikeCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const severityConfig = {
    high: { bg: 'bg-danger-50', border: 'border-danger-200', text: 'text-danger-700', icon: 'bg-danger-500', label: '高风险' },
    medium: { bg: 'bg-warning-50', border: 'border-warning-200', text: 'text-warning-700', icon: 'bg-warning-500', label: '中风险' },
    low: { bg: 'bg-brand-50', border: 'border-brand-200', text: 'text-brand-700', icon: 'bg-brand-500', label: '关注' },
  };
  
  const config = severityConfig[spike.severity];
  
  const handleViewMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewMore?.(spike);
  };
  
  return (
    <div 
      className={cn(
        'rounded-xl border overflow-hidden transition-all duration-300 animate-slide-up',
        config.bg,
        config.border,
        isExpanded && 'shadow-lg'
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className="p-4 cursor-pointer hover:brightness-95 transition-all"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
            config.bg
          )}>
            <AlertTriangle className={cn('w-5 h-5', config.text)} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: spike.brandColor }}
              />
              <span className="font-semibold text-dark-900">{spike.brandName}</span>
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium',
                config.bg,
                config.text
              )}>
                {config.label}
              </span>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <span className="flex items-center gap-1 text-dark-600">
                <TrendingUp className="w-4 h-4 text-success-600" />
                <span className="font-semibold text-success-600">
                  +{formatPercent(spike.growthRate)}
                </span>
              </span>
              <span className="text-dark-400">|</span>
              <span className="text-dark-600">
                {spike.platformName}
              </span>
              <span className="text-dark-400">|</span>
              <span className="flex items-center gap-1 text-dark-600">
                <Calendar className="w-4 h-4" />
                {spike.date}
              </span>
            </div>
            
            <div className="mt-2 flex items-center gap-4 text-xs text-dark-500">
              <span>当前声量: <span className="font-mono font-medium text-dark-700">{formatNumber(spike.volume)}</span></span>
              <span>前日: <span className="font-mono font-medium text-dark-700">{formatNumber(spike.previousVolume)}</span></span>
            </div>
          </div>
          
          <div className={cn('transition-transform duration-200', config.text)}>
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-4 pb-4 pt-0">
          <div className="border-t border-dark-200/50 pt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-dark-700">代表内容</p>
              <button
                onClick={handleViewMore}
                className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
              >
                查看更多
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-3">
              {spike.representativePosts.length > 0 ? (
                spike.representativePosts.map((post: PostContent) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    getSentimentLabel={getSentimentLabel}
                  />
                ))
              ) : (
                <div className="p-6 bg-white/60 rounded-xl text-center">
                  <div className="w-12 h-12 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="w-6 h-6 text-dark-400" />
                  </div>
                  <p className="text-sm text-dark-600 mb-2">
                    暂无 <span className="font-medium">{spike.brandName}</span> 在 <span className="font-medium">{spike.platformName}</span> 的代表内容
                  </p>
                  <p className="text-xs text-dark-500 mb-3">
                    {spike.date} 该平台声量增长 {formatPercent(spike.growthRate)}，但内容池暂无匹配数据
                  </p>
                  <button
                    onClick={handleViewMore}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-brand-500 text-white text-xs font-medium rounded-lg hover:bg-brand-600 transition-colors"
                  >
                    前往热点内容池
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
