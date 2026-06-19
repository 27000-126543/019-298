import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, Users, Activity, Calendar, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useVolumeData } from '@/hooks/useVolumeData';
import { useShareData } from '@/hooks/useShareData';
import { Header } from '@/components/layout/Header';
import { KPICard } from '@/components/cards/KPICard';
import { VolumeTrendChart } from '@/components/charts/VolumeTrendChart';
import { SharePieChart } from '@/components/charts/SharePieChart';
import { PlatformBarChart } from '@/components/charts/PlatformBarChart';
import { Button } from '@/components/ui/Button';
import { TimeRange, PLATFORMS } from '@/types';
import { formatDateCN } from '@/utils/dateUtils';
import { formatNumber, formatPercent } from '@/utils/numberUtils';
import { cn } from '@/lib/utils';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { config, timeRange, setTimeRange } = useAppStore();
  const { brandData, currentData, previousData, getBrandTotalVolume, getBrandGrowthRate, getPlatformVolume } = useVolumeData();
  const { shareData, brandRanking, currentRange } = useShareData();
  
  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: 'yesterday', label: '昨天' },
    { value: '7days', label: '近 7 天' },
    { value: 'custom', label: '活动周期' },
  ];
  
  const kpiData = useMemo(() => {
    if (!brandData || currentData.length === 0 || previousData.length === 0) return [];
    
    const brandTotal = getBrandTotalVolume(brandData);
    const brandGrowth = getBrandGrowthRate(currentData[0], previousData[0]);
    
    const myBrandRank = brandRanking.find(b => b.brandId === config?.brand.id);
    const rankValue = myBrandRank?.rank || 1;
    const rankGrowth = 0;
    
    const totalVolume = currentData.reduce((sum, b) => sum + getBrandTotalVolume(b), 0);
    const prevTotalVolume = previousData.reduce((sum, b) => sum + getBrandTotalVolume(b), 0);
    const totalGrowth = prevTotalVolume > 0 ? (totalVolume - prevTotalVolume) / prevTotalVolume : 0;
    
    const myBrandShare = myBrandRank?.share || 0;
    const shareGrowth = myBrandRank?.growth || 0;
    
    return [
      {
        title: '品牌总声量',
        value: brandTotal,
        growth: brandGrowth,
        icon: <BarChart3 className="w-5 h-5" />,
        color: '#3B82F6',
      },
      {
        title: '全网总声量',
        value: totalVolume,
        growth: totalGrowth,
        icon: <Activity className="w-5 h-5" />,
        color: '#10B981',
      },
      {
        title: '声量份额',
        value: Math.round(myBrandShare * 10000) / 100,
        growth: shareGrowth,
        icon: <TrendingUp className="w-5 h-5" />,
        color: '#8B5CF6',
        isPercent: true,
      },
      {
        title: '行业排名',
        value: rankValue,
        growth: rankGrowth,
        icon: <Users className="w-5 h-5" />,
        color: '#F59E0B',
        isRank: true,
      },
    ];
  }, [brandData, currentData, previousData, getBrandTotalVolume, getBrandGrowthRate, brandRanking, config]);
  
  const handleChartPointClick = (date: string) => {
    navigate('/details');
  };
  
  if (!config) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-dark-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-dark-900">声量走势看板</h1>
            <p className="text-dark-500 mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDateCN(new Date(currentRange.start))} - {formatDateCN(new Date(currentRange.end))}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex bg-white rounded-lg border border-dark-200 p-1">
              {timeRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
                    timeRange === option.value
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-dark-600 hover:text-dark-900 hover:bg-dark-50'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            
            <Button variant="secondary" onClick={() => navigate('/details')}>
              详情分析
              <ChevronDown className="w-4 h-4 ml-1 rotate-[-90deg]" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpiData.map((kpi, index) => (
            <KPICard
              key={kpi.title}
              title={kpi.title}
              value={kpi.isPercent ? kpi.value : kpi.value}
              growth={kpi.growth}
              icon={kpi.icon}
              color={kpi.color}
              delay={index * 100}
            />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-dark-100 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-dark-900">
                  {config.brand.name} 声量走势
                </h3>
                <p className="text-sm text-dark-500 mt-1">
                  点击数据点可查看当天详情内容
                </p>
              </div>
            </div>
            
            {brandData && (
              <VolumeTrendChart
                data={brandData}
                showArea={true}
                height={350}
                onPointClick={handleChartPointClick}
              />
            )}
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-dark-100 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h3 className="text-lg font-semibold text-dark-900 mb-4">
              平台声量分布
            </h3>
            
            {brandData && (
              <SharePieChart
                data={PLATFORMS.map(p => ({
                  brandId: p.key,
                  brandName: p.name,
                  color: p.color,
                  totalVolume: getPlatformVolume(brandData, p.key),
                  share: getPlatformVolume(brandData, p.key) / getBrandTotalVolume(brandData),
                  growth: 0,
                  platformBreakdown: [],
                }))}
                height={300}
                showCenterLabel={true}
              />
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-dark-100 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h3 className="text-lg font-semibold text-dark-900 mb-4">
              品牌声量份额
            </h3>
            <SharePieChart
              data={shareData}
              height={300}
              showCenterLabel={true}
            />
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-dark-100 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <h3 className="text-lg font-semibold text-dark-900 mb-4">
              各平台品牌对比
            </h3>
            <PlatformBarChart
              data={shareData}
              height={300}
            />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-dark-100 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <h3 className="text-lg font-semibold text-dark-900 mb-4">
            品牌竞品对比
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-500">品牌</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-dark-500">排名</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-dark-500">总声量</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-dark-500">份额</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-dark-500">环比</th>
                  {PLATFORMS.map(p => (
                    <th key={p.key} className="text-right py-3 px-4 text-sm font-medium text-dark-500">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {brandRanking.map((brand, index) => {
                  const isMyBrand = brand.brandId === config.brand.id;
                  const maxVolume = brandRanking[0]?.totalVolume || 1;
                  
                  return (
                    <tr
                      key={brand.brandId}
                      className={cn(
                        'border-b border-dark-100 transition-colors',
                        isMyBrand ? 'bg-brand-50/50' : 'hover:bg-dark-50',
                        index % 2 === 0 && !isMyBrand && 'bg-dark-50/30'
                      )}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: brand.color }}
                          />
                          <span className={cn(
                            'font-medium',
                            isMyBrand ? 'text-brand-700' : 'text-dark-900'
                          )}>
                            {brand.brandName}
                            {isMyBrand && <span className="ml-2 text-xs text-brand-500">(我的品牌)</span>}
                          </span>
                        </div>
                      </td>
                      <td className="text-right py-4 px-4">
                        <span className={cn(
                          'inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold',
                          brand.rank === 1 ? 'bg-warning-500 text-white' :
                          brand.rank === 2 ? 'bg-dark-400 text-white' :
                          brand.rank === 3 ? 'bg-warning-700 text-white' :
                          'bg-dark-200 text-dark-700'
                        )}>
                          {brand.rank}
                        </span>
                      </td>
                      <td className="text-right py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-24 h-2 bg-dark-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${(brand.totalVolume / maxVolume) * 100}%`,
                                backgroundColor: brand.color,
                              }}
                            />
                          </div>
                          <span className="font-mono text-sm font-medium text-dark-900 min-w-[80px] text-right">
                            {formatNumber(brand.totalVolume)}
                          </span>
                        </div>
                      </td>
                      <td className="text-right py-4 px-4 font-mono text-sm text-dark-900">
                        {formatPercent(brand.share)}
                      </td>
                      <td className="text-right py-4 px-4">
                        <span className={cn(
                          'text-sm font-medium',
                          brand.growth > 0.05 ? 'text-success-600' :
                          brand.growth < -0.05 ? 'text-danger-600' :
                          'text-dark-500'
                        )}>
                          {brand.growth > 0.05 ? '+' : ''}{formatPercent(brand.growth)}
                        </span>
                      </td>
                      {PLATFORMS.map(p => {
                        const breakdown = brand.platformBreakdown.find(b => b.platform === p.key);
                        return (
                          <td key={p.key} className="text-right py-4 px-4 font-mono text-sm text-dark-700">
                            {breakdown ? formatNumber(breakdown.volume) : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
