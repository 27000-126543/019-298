import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Heart, MessageCircle, Share2, Megaphone } from 'lucide-react';
import { PostContent } from '@/types';
import { Tag } from '@/components/ui/Tag';
import { PLATFORMS } from '@/types';
import { getRelativeTime } from '@/utils/dateUtils';
import { formatNumber } from '@/utils/numberUtils';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: PostContent;
  isExpanded: boolean;
  onToggle: () => void;
  getSentimentLabel: (sentiment: string) => { text: string; color: string };
}

export const PostCard = ({ post, isExpanded, onToggle, getSentimentLabel }: PostCardProps) => {
  const [imageError, setImageError] = useState(false);
  const platform = PLATFORMS.find(p => p.key === post.platform);
  const sentiment = getSentimentLabel(post.sentiment);
  
  return (
    <div className={cn(
      'bg-white rounded-xl border border-dark-200 overflow-hidden transition-all duration-300',
      isExpanded && 'shadow-lg'
    )}>
      <div
        className="p-4 cursor-pointer hover:bg-dark-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start gap-3">
          {!imageError ? (
            <img
              src={post.authorAvatar}
              alt={post.author}
              className="w-10 h-10 rounded-full flex-shrink-0"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-dark-200 flex items-center justify-center flex-shrink-0">
              <span className="text-dark-600 font-medium text-sm">
                {post.author.charAt(0)}
              </span>
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-dark-900">{post.author}</span>
              <span className="text-xs text-dark-500">{platform?.name}</span>
              <span className="text-xs text-dark-400">{getRelativeTime(post.publishTime)}</span>
              {post.isAd && (
                <Tag variant="primary" className="flex items-center gap-1">
                  <Megaphone className="w-3 h-3" />
                  推广
                </Tag>
              )}
            </div>
            
            <h4 className="mt-1 font-medium text-dark-900 line-clamp-2">
              {post.title}
            </h4>
            
            <div className="mt-2 flex items-center gap-2">
              <Tag variant={post.sentiment === 'positive' ? 'success' : post.sentiment === 'negative' ? 'danger' : 'default'}>
                {sentiment.text}
              </Tag>
              
              <div className="flex items-center gap-3 text-xs text-dark-500 ml-auto">
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5" />
                  {formatNumber(post.engagement.likes)}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" />
                  {formatNumber(post.engagement.comments)}
                </span>
                <span className="flex items-center gap-1">
                  <Share2 className="w-3.5 h-3.5" />
                  {formatNumber(post.engagement.shares)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-dark-400">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-dark-100">
          <p className="mt-4 text-sm text-dark-700 leading-relaxed">
            {post.content}
          </p>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-dark-500">
              总互动量: {formatNumber(post.engagement.likes + post.engagement.comments + post.engagement.shares)}
            </div>
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              查看原文
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
