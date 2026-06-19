import { useState } from 'react';
import { ExternalLink, Heart, MessageCircle, Share2, Megaphone, TrendingUp } from 'lucide-react';
import { PostContent } from '@/types';
import { Tag } from '@/components/ui/Tag';
import { PLATFORMS } from '@/types';
import { getRelativeTime } from '@/utils/dateUtils';
import { formatNumber } from '@/utils/numberUtils';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: PostContent;
  showContent?: boolean;
  getSentimentLabel: (sentiment: string) => { text: string; color: string };
}

export const PostCard = ({ post, showContent = false, getSentimentLabel }: PostCardProps) => {
  const [imageError, setImageError] = useState(false);
  const platform = PLATFORMS.find(p => p.key === post.platform);
  const sentiment = getSentimentLabel(post.sentiment);
  const totalEngagement = post.engagement.likes + post.engagement.comments + post.engagement.shares;
  
  return (
    <div className="bg-white rounded-xl border border-dark-200 overflow-hidden hover:shadow-md transition-all duration-200">
      <div className="p-4">
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
              <span 
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${platform?.color}15`, color: platform?.color }}
              >
                {platform?.name}
              </span>
              <span className="text-xs text-dark-400">{getRelativeTime(post.publishTime)}</span>
              {post.isAd && (
                <Tag variant="primary" className="flex items-center gap-1">
                  <Megaphone className="w-3 h-3" />
                  推广
                </Tag>
              )}
            </div>
            
            <h4 className="mt-2 font-medium text-dark-900 leading-snug">
              {post.title}
            </h4>
            
            {showContent && (
              <p className="mt-2 text-sm text-dark-700 leading-relaxed">
                {post.content}
              </p>
            )}
            
            <div className="mt-3 flex items-center gap-3 flex-wrap">
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
                <span className="flex items-center gap-1 text-dark-600 font-medium">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {formatNumber(totalEngagement)}
                </span>
              </div>
            </div>
            
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-dark-400">
                总互动: {formatNumber(totalEngagement)}
              </span>
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                查看原文
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
