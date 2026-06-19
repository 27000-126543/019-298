import { Bookmark, Calendar, X, Eye } from 'lucide-react';
import { SavedInsightView, PLATFORMS } from '@/types';
import { getRelativeTime } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

interface SavedInsightCardProps {
  view: SavedInsightView;
  onOpen: (view: SavedInsightView) => void;
  onRemove: (id: string) => void;
  delay?: number;
}

export const SavedInsightCard = ({ view, onOpen, onRemove, delay = 0 }: SavedInsightCardProps) => {
  const platform = PLATFORMS.find(p => p.key === view.platform);
  
  return (
    <div 
      className={cn(
        'relative group p-4 bg-white rounded-xl border border-dark-200 hover:border-brand-300 hover:shadow-md transition-all duration-200 animate-slide-up cursor-pointer'
      )}
      style={{ animationDelay: `${delay}ms` }}
      onClick={() => onOpen(view)}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(view.id);
        }}
        className="absolute top-2 right-2 p-1.5 rounded-lg text-dark-400 hover:text-danger-600 hover:bg-danger-50 opacity-0 group-hover:opacity-100 transition-all"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
          <Bookmark className="w-5 h-5 text-brand-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-dark-900 truncate mb-1">
            {view.name}
          </h4>
          
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {platform && (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium text-white"
                style={{ backgroundColor: platform.color }}
              >
                {platform.name}
              </span>
            )}
            <span className="text-xs text-dark-500 font-medium">
              {view.brandName}
            </span>
            <span className="flex items-center gap-1 text-xs text-dark-500">
              <Calendar className="w-3 h-3" />
              {view.date}
            </span>
          </div>
          
          {view.sentimentFilter && view.sentimentFilter !== 'all' && (
            <span className={cn(
              'inline-block text-[11px] px-1.5 py-0.5 rounded mr-1',
              view.sentimentFilter === 'positive' && 'bg-success-50 text-success-700',
              view.sentimentFilter === 'negative' && 'bg-danger-50 text-danger-700',
              view.sentimentFilter === 'neutral' && 'bg-dark-100 text-dark-700',
            )}>
              {view.sentimentFilter === 'positive' && '正面'}
              {view.sentimentFilter === 'negative' && '负面'}
              {view.sentimentFilter === 'neutral' && '中性'}
            </span>
          )}
          {view.typeFilter && view.typeFilter !== 'all' && (
            <span className="inline-block text-[11px] px-1.5 py-0.5 rounded bg-warning-50 text-warning-700">
              {view.typeFilter === 'ad' ? '推广' : '自然'}
            </span>
          )}
          
          <p className="text-[11px] text-dark-400 mt-2">
            {getRelativeTime(view.createdAt)}
          </p>
        </div>
        
        <div className="flex-shrink-0 p-2 rounded-lg bg-dark-50 text-dark-500 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
          <Eye className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
