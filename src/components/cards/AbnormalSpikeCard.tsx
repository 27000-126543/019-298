import { useState } from 'react';
import { TrendingUp, AlertTriangle, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { AbnormalSpike, PostContent } from '@/types';
import { PostCard } from './PostCard';
import { formatNumber, formatPercent } from '@/utils/numberUtils';
import { cn } from '@/lib/utils';

interface AbnormalSpikeCardProps {
  spike: AbnormalSpike;
  getSentimentLabel: (sentiment: string) => { text: string; color: string };
  delay?: number;
}

export const AbnormalSpikeCard = ({ spike, getSentimentLabel, delay = 0 }: AbnormalSpikeCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const severityConfig = {
    high: { bg: 'bg-danger-50', border: 'border-danger-200', text: 'text-danger-700', icon: 'bg-danger-500', label: '高风险' },
    medium: { bg: 'bg-warning-50', border: 'border-warning-200', text: 'text-warning-700', icon: 'bg-warning-500', label: '中风险' },
    low: { bg: 'bg-brand-50', border: 'border-brand-200', text: 'text-brand-700', icon: 'bg-brand-500', label: '关注' },
  };
  
  const config = severityConfig[spike.severity];
  
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
            <p className="text-sm font-medium text-dark-700 mb-3">代表内容</p>
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
                <div className="text-center py-4 text-sm text-dark-500">
                  暂无代表内容
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
