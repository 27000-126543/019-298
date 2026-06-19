import { useMemo } from 'react';
import {
  LineChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BrandVolumeData, VolumeDataPoint, PLATFORMS } from '@/types';
import { formatDateCN } from '@/utils/dateUtils';
import { formatNumber } from '@/utils/numberUtils';
import { useAppStore } from '@/store/appStore';

interface VolumeTrendChartProps {
  data: BrandVolumeData;
  showArea?: boolean;
  height?: number;
  onPointClick?: (date: string) => void;
  enabledPlatforms?: string[];
}

export const VolumeTrendChart = ({ data, showArea = true, height = 350, onPointClick, enabledPlatforms }: VolumeTrendChartProps) => {
  const { selectedDate, setSelectedDate } = useAppStore();
  
  const platforms = useMemo(() => {
    if (enabledPlatforms && enabledPlatforms.length > 0) {
      return PLATFORMS.filter(p => enabledPlatforms.includes(p.key));
    }
    return PLATFORMS;
  }, [enabledPlatforms]);
  
  const chartData = useMemo(() => {
    return data.data.map(d => {
      const platformKeys = platforms.map(p => p.key);
      const filteredTotal = platformKeys.reduce((sum, key) => {
        return sum + (d[key as keyof typeof d] as number);
      }, 0);
      return {
        ...d,
        filteredTotal,
        dateCN: formatDateCN(new Date(d.date)),
      };
    });
  }, [data, platforms]);
  
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (!active || !payload || !payload.length) return null;
    
    return (
      <div className="bg-white rounded-lg shadow-lg border border-dark-200 p-3 min-w-[180px]">
        <p className="text-sm font-medium text-dark-900 mb-2">{label}</p>
        {payload.map((entry, index) => {
          const platform = PLATFORMS.find(p => p.key === entry.name);
          const displayName = entry.name === 'total' ? '总声量' : platform?.name || entry.name;
          return (
            <div key={index} className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-dark-600">{displayName}</span>
              </div>
              <span className="font-mono font-medium text-dark-900">
                {formatNumber(entry.value)}
              </span>
            </div>
          );
        })}
      </div>
    );
  };
  
  const handleClick = (data: { activePayload?: Array<{ payload: VolumeDataPoint }> }) => {
    if (data.activePayload && data.activePayload.length > 0) {
      const date = data.activePayload[0].payload.date;
      setSelectedDate(date);
      onPointClick?.(date);
    }
  };
  
  const lines = useMemo(() => {
    const result = [
      { key: 'filteredTotal', name: '总声量', color: data.color, strokeWidth: 3 },
    ];
    platforms.forEach(p => {
      result.push({
        key: p.key,
        name: p.name,
        color: p.color,
        strokeWidth: 1.5,
      });
    });
    return result;
  }, [data.color, platforms]);
  
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        {showArea ? (
          <AreaChart
            data={chartData}
            onClick={handleClick}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={data.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={data.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="dateCN"
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
              formatter={(value) => {
                const line = lines.find(l => l.key === value);
                return <span className="text-sm text-dark-600">{line?.name || value}</span>;
              }}
            />
            {lines.map((line, index) => (
              index === 0 ? (
                <Area
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  stroke={line.color}
                  strokeWidth={line.strokeWidth}
                  fill="url(#colorTotal)"
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    const isSelected = payload.date === selectedDate;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isSelected ? 8 : 4}
                        fill={isSelected ? line.color : 'transparent'}
                        stroke={line.color}
                        strokeWidth={2}
                        style={{ cursor: 'pointer' }}
                      />
                    );
                  }}
                />
              ) : (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  stroke={line.color}
                  strokeWidth={line.strokeWidth}
                  dot={false}
                  strokeDasharray="5 5"
                />
              )
            ))}
          </AreaChart>
        ) : (
          <LineChart
            data={chartData}
            onClick={handleClick}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="dateCN"
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
              formatter={(value) => {
                const line = lines.find(l => l.key === value);
                return <span className="text-sm text-dark-600">{line?.name || value}</span>;
              }}
            />
            {lines.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke={line.color}
                strokeWidth={line.strokeWidth}
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  const isSelected = payload.date === selectedDate;
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 8 : 4}
                      fill={isSelected ? line.color : 'transparent'}
                      stroke={line.color}
                      strokeWidth={2}
                      style={{ cursor: 'pointer' }}
                    />
                  );
                }}
              />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
