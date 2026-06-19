import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ShareData, PLATFORMS } from '@/types';
import { formatNumber, formatPercent } from '@/utils/numberUtils';

interface PlatformBarChartProps {
  data: ShareData[];
  height?: number;
}

export const PlatformBarChart = ({ data, height = 300 }: PlatformBarChartProps) => {
  const chartData = useMemo(() => {
    const platforms = PLATFORMS.map(p => p.key);
    
    return platforms.map(platform => {
      const platformData: Record<string, unknown> = { platform };
      const platformInfo = PLATFORMS.find(p => p.key === platform);
      
      platformData.platformName = platformInfo?.name || platform;
      
      data.forEach(brand => {
        const breakdown = brand.platformBreakdown.find(b => b.platform === platform);
        platformData[brand.brandName] = breakdown?.volume || 0;
        platformData[`${brand.brandName}_color`] = brand.color;
      });
      
      return platformData;
    });
  }, [data]);
  
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (!active || !payload || !payload.length) return null;
    
    const total = payload.reduce((sum, p) => sum + p.value, 0);
    
    return (
      <div className="bg-white rounded-lg shadow-lg border border-dark-200 p-3 min-w-[200px]">
        <p className="text-sm font-medium text-dark-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm mb-1">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-dark-600">{entry.name}</span>
            </div>
            <div className="text-right">
              <span className="font-mono font-medium text-dark-900">
                {formatNumber(entry.value)}
              </span>
              <span className="text-dark-400 text-xs ml-1">
                ({formatPercent(entry.value / total, 0)})
              </span>
            </div>
          </div>
        ))}
        <div className="border-t border-dark-200 mt-2 pt-2 flex justify-between text-sm">
          <span className="text-dark-600">总计</span>
          <span className="font-mono font-medium text-dark-900">{formatNumber(total)}</span>
        </div>
      </div>
    );
  };
  
  const brands = data.map(d => ({ name: d.brandName, color: d.color }));
  
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis
            dataKey="platformName"
            stroke="#94A3B8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#94A3B8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => formatNumber(value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
            formatter={(value) => <span className="text-sm text-dark-600">{value}</span>}
          />
          {brands.map((brand, index) => (
            <Bar
              key={brand.name}
              dataKey={brand.name}
              fill={brand.color}
              radius={[index === 0 ? 4 : 0, index === 0 ? 4 : 0, 0, 0]}
              animationBegin={index * 100}
              animationDuration={600}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
