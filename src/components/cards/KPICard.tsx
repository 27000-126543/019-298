import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { formatNumber, formatGrowth } from '@/utils/numberUtils';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: number;
  growth: number;
  icon: React.ReactNode;
  color: string;
  delay?: number;
}

export const KPICard = ({ title, value, growth, icon, color, delay = 0 }: KPICardProps) => {
  const isPositive = growth > 0.05;
  const isNegative = growth < -0.05;
  
  const growthColor = isPositive
    ? 'text-success-600'
    : isNegative
    ? 'text-danger-600'
    : 'text-dark-500';
  
  const growthBg = isPositive
    ? 'bg-success-50'
    : isNegative
    ? 'bg-danger-50'
    : 'bg-dark-100';
  
  return (
    <div
      className="bg-white rounded-xl p-5 shadow-sm border border-dark-100 hover:shadow-md transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-dark-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-dark-900 font-mono">
            {formatNumber(value)}
          </p>
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {icon}
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-2">
        <span className={cn(
          'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium',
          growthBg,
          growthColor
        )}>
          {isPositive && <ArrowUpRight className="w-3.5 h-3.5" />}
          {isNegative && <ArrowDownRight className="w-3.5 h-3.5" />}
          {!isPositive && !isNegative && <Minus className="w-3.5 h-3.5" />}
          {formatGrowth(growth)}
        </span>
        <span className="text-xs text-dark-500">较上周期</span>
      </div>
    </div>
  );
};
