import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { ShareData } from '@/types';
import { formatNumber, formatPercent } from '@/utils/numberUtils';

interface SharePieChartProps {
  data: ShareData[];
  height?: number;
  showCenterLabel?: boolean;
}

export const SharePieChart = ({ data, height = 350, showCenterLabel = true }: SharePieChartProps) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      name: item.brandName,
      value: item.totalVolume,
      share: item.share,
      color: item.color,
    }));
  }, [data]);
  
  const totalVolume = useMemo(() => {
    return data.reduce((sum, item) => sum + item.totalVolume, 0);
  }, [data]);
  
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { share: number; color: string } }> }) => {
    if (!active || !payload || !payload.length) return null;
    
    const item = payload[0];
    return (
      <div className="bg-white rounded-lg shadow-lg border border-dark-200 p-3 min-w-[180px]">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: item.payload.color }}
          />
          <p className="text-sm font-medium text-dark-900">{item.name}</p>
        </div>
        <div className="flex justify-between gap-4 text-sm">
          <span className="text-dark-600">声量</span>
          <span className="font-mono font-medium text-dark-900">
            {formatNumber(item.value)}
          </span>
        </div>
        <div className="flex justify-between gap-4 text-sm">
          <span className="text-dark-600">占比</span>
          <span className="font-mono font-medium text-dark-900">
            {formatPercent(item.payload.share)}
          </span>
        </div>
      </div>
    );
  };
  
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
  }) => {
    if (percent < 0.05) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-sm font-bold"
      >
        {formatPercent(percent, 0)}
      </text>
    );
  };
  
  return (
    <div className="w-full relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={showCenterLabel ? renderCustomLabel : undefined}
            outerRadius={130}
            innerRadius={showCenterLabel ? 70 : 0}
            dataKey="value"
            paddingAngle={2}
            animationBegin={0}
            animationDuration={800}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-sm text-dark-600">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {showCenterLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-xs text-dark-500 mb-1">总声量</p>
          <p className="text-2xl font-bold text-dark-900 font-mono">
            {formatNumber(totalVolume)}
          </p>
        </div>
      )}
    </div>
  );
};
