import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { PlatformGrowth } from '@/types';
import { formatNumber, formatGrowth } from '@/utils/numberUtils';
import { PLATFORMS } from '@/types';

interface PlatformGrowthCardProps {
  data: PlatformGrowth;
  type: 'growth' | 'decline';
  delay?: number;
}

export const PlatformGrowthCard = ({ data, type, delay = 0 }: PlatformGrowthCardProps) => {
  const platform = PLATFORMS.find(p => p.key === data.platform);
  const isGrowth = type === 'growth';
  
  const bgGradient = isGrowth
    ? 'from-success-500/10 to-success-500/5 border-success-200'
    : 'from-danger-500/10 to-danger-500/5 border-danger-200';
  
  const textColor = isGrowth ? 'text-success-600' : 'text-danger-600';
  const iconColor = isGrowth ? '#10B981' : '#EF4444';
  
  return (
    <div
      className={`bg-gradient-to-br ${bgGradient} rounded-xl p-5 border animate-fade-in`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-dark-600">{platform?.name || data.platformName}</p>
          <p className="mt-1 text-2xl font-bold text-dark-900 font-mono">
            {formatNumber(data.currentVolume)}
          </p>
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${iconColor}20` }}
        >
          {isGrowth ? (
            <ArrowUpRight className="w-5 h-5" style={{ color: iconColor }} />
          ) : (
            <ArrowDownRight className="w-5 h-5" style={{ color: iconColor }} />
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <span className={`text-2xl font-bold ${textColor} font-mono`}>
          {formatGrowth(data.growthRate)}
        </span>
        <p className="text-xs text-dark-500 mt-1">
          上周期 {formatNumber(data.previousVolume)}
        </p>
      </div>
    </div>
  );
};
