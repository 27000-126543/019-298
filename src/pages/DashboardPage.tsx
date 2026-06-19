import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, Users, Activity, Calendar, ChevronDown, X, Filter, ArrowUpDown, RotateCcw, AlertTriangle, BookmarkPlus, Bookmark } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useVolumeData } from '@/hooks/useVolumeData';
import { useShareData } from '@/hooks/useShareData';
import { usePostContent } from '@/hooks/usePostContent';
import { useAbnormalSpikes } from '@/hooks/useAbnormalSpikes';
import { Header } from '@/components/layout/Header';
import { KPICard } from '@/components/cards/KPICard';
import { VolumeTrendChart } from '@/components/charts/VolumeTrendChart';
import { SharePieChart } from '@/components/charts/SharePieChart';
import { PlatformBarChart } from '@/components/charts/PlatformBarChart';
import { PostCard } from '@/components/cards/PostCard';
import { AbnormalSpikeCard } from '@/components/cards/AbnormalSpikeCard';
import { SavedInsightCard } from '@/components/cards/SavedInsightCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TimeRange, PLATFORMS, SortField, SortOrder, AbnormalSpike, SavedInsightView } from '@/types';
import { formatDateCN } from '@/utils/dateUtils';
import { formatNumber, formatPercent } from '@/utils/numberUtils';
import { generateMarketReviewCSV, downloadCSV } from '@/utils/exportUtils';
import { cn } from '@/lib/utils';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { 
    config, 
    timeRange, 
    setTimeRange, 
    customDateRange, 
    setCustomDateRange, 
    selectedDate, 
    setSelectedDate, 
    postFilter, 
    setPostFilter,
    savedInsightViews,
    addInsightView,
    removeInsightView,
  } = useAppStore();
  const { brandData, currentData, previousData, getBrandTotalVolume, getBrandGrowthRate, getPlatformVolume, enabledPlatforms, currentRange } = useVolumeData();
  const { shareData, brandRanking, enabledPlatformList } = useShareData();
  const { 
    filteredPosts, 
    postsBySentiment, 
    getSentimentLabel,
    platformFilter,
    setPlatformFilter,
    sentimentFilter,
    setSentimentFilter,
    typeFilter,
    setTypeFilter,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    toggleSortOrder,
    resetFilters,
    enabledPlatforms: postEnabledPlatforms,
  } = usePostContent();
  const { competitorSpikes } = useAbnormalSpikes();
  
  const [showPostModal, setShowPostModal] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<string>(customDateRange?.start || '');
  const [tempEndDate, setTempEndDate] = useState<string>(customDateRange?.end || '');
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  
  const isValidCustomRange = timeRange !== 'custom' || (
    customDateRange?.start && 
    customDateRange?.end && 
    customDateRange.start <= customDateRange.end
  );
  
  const canDisplayDate = timeRange !== 'custom' || isValidCustomRange;
  
  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: 'yesterday', label: '昨天' },
    { value: '7days', label: '近 7 天' },
    { value: 'custom', label: '活动周期' },
  ];
  
  const applyCustomDateRange = (start: string, end: string) => {
    if (start && end && start <= end) {
      setCustomDateRange({ start, end });
    }
  };
  
  const handleTempStartChange = (value: string) => {
    setTempStartDate(value);
    applyCustomDateRange(value, tempEndDate);
  };
  
  const handleTempEndChange = (value: string) => {
    setTempEndDate(value);
    applyCustomDateRange(tempStartDate, value);
  };
  
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
  
  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    if (range !== 'custom') {
      setCustomDateRange(null);
    } else {
      setTempStartDate(customDateRange?.start || '');
      setTempEndDate(customDateRange?.end || '');
    }
  };
  
  const handleViewMore = (spike: AbnormalSpike) => {
    setPostFilter({
      platform: spike.platform,
      brandName: spike.brandName,
      date: spike.date,
    });
    setSelectedDate(spike.date);
    setShowPostModal(true);
  };
  
  const handleChartPointClick = (date: string) => {
    setPostFilter(null);
    setSelectedDate(date);
    setShowPostModal(true);
  };
  
  const handleSaveView = () => {
    const currentPlatform = platformFilter !== 'all' ? platformFilter : (postFilter?.platform || 'all');
    const currentBrand = postFilter?.brandName || config?.brand.name || '';
    const currentDate = selectedDate || '';
    
    if (!newViewName.trim() || !currentDate) return;
    
    addInsightView({
      name: newViewName.trim(),
      platform: currentPlatform,
      brandName: currentBrand,
      date: currentDate,
      sentimentFilter: sentimentFilter,
      typeFilter: typeFilter,
    });
    
    setNewViewName('');
    setShowSaveViewModal(false);
  };
  
  const handleOpenInsightView = (view: SavedInsightView) => {
    setPostFilter({
      platform: view.platform,
      brandName: view.brandName,
      date: view.date,
    });
    setSelectedDate(view.date);
    if (view.sentimentFilter) setSentimentFilter(view.sentimentFilter);
    if (view.typeFilter) setTypeFilter(view.typeFilter);
    setShowPostModal(true);
  };
  
  const handleExportReport = () => {
    if (!config) return;
    
    const timeRangeLabels: Record<TimeRange, string> = {
      yesterday: '昨天',
      '7days': '近7天',
      custom: '活动周期',
    };
    
    const csvContent = generateMarketReviewCSV({
      timeRangeLabel: timeRangeLabels[timeRange],
      dateRange: currentRange,
      dataSources: config.dataSources,
      enabledPlatformList,
      brandRanking,
      competitorSpikes,
      brandName: config.brand.name,
    });
    
    const filename = `市场复盘_${config.brand.name}_${currentRange.start}_${currentRange.end}.csv`;
    downloadCSV(csvContent, filename);
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
              {canDisplayDate ? (
                <>
                  {formatDateCN(new Date(currentRange.start))} - {formatDateCN(new Date(currentRange.end))}
                </>
              ) : (
                <span className="text-warning-600">请选择活动周期的开始和结束日期</span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-white rounded-lg border border-dark-200 p-1">
              {timeRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleTimeRangeChange(option.value)}
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
            
            {timeRange === 'custom' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={tempStartDate}
                  onChange={(e) => handleTempStartChange(e.target.value)}
                  className="px-3 py-2 text-sm border border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <span className="text-dark-500">至</span>
                <input
                  type="date"
                  value={tempEndDate}
                  onChange={(e) => handleTempEndChange(e.target.value)}
                  className="px-3 py-2 text-sm border border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            )}
            
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
            
            {brandData && isValidCustomRange ? (
              <VolumeTrendChart
                data={brandData}
                showArea={true}
                height={350}
                onPointClick={handleChartPointClick}
                enabledPlatforms={enabledPlatforms}
              />
            ) : (
              <div className="flex items-center justify-center h-[350px] text-dark-500">
                {timeRange === 'custom' && !isValidCustomRange 
                  ? '请选择有效的活动周期日期范围'
                  : '暂无数据'
                }
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-dark-100 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h3 className="text-lg font-semibold text-dark-900 mb-4">
              平台声量分布
            </h3>
            
            {brandData && isValidCustomRange ? (
              <SharePieChart
                data={enabledPlatformList.map(p => ({
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
            ) : (
              <div className="flex items-center justify-center h-[300px] text-dark-500">
                {timeRange === 'custom' && !isValidCustomRange 
                  ? '请选择有效的活动周期日期范围'
                  : '暂无数据'
                }
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-dark-100 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h3 className="text-lg font-semibold text-dark-900 mb-4">
              品牌声量份额
            </h3>
            {isValidCustomRange ? (
              <SharePieChart
                data={shareData}
                height={300}
                showCenterLabel={true}
              />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-dark-500">
                请选择有效的活动周期日期范围
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-dark-100 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <h3 className="text-lg font-semibold text-dark-900 mb-4">
              各平台品牌对比
            </h3>
            {isValidCustomRange ? (
              <PlatformBarChart
                data={shareData}
                height={300}
              />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-dark-500">
                请选择有效的活动周期日期范围
              </div>
            )}
          </div>
        </div>
        
        {isValidCustomRange && competitorSpikes.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-dark-100 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-danger-50 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-danger-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-dark-900">竞品异常波动提醒</h3>
                <p className="text-sm text-dark-500 mt-0.5">
                  检测到 {competitorSpikes.length} 个竞品异常增长事件，点击卡片查看日期和代表内容
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {competitorSpikes.slice(0, 6).map((spike, index) => (
                <AbnormalSpikeCard
                  key={spike.id}
                  spike={spike}
                  getSentimentLabel={getSentimentLabel}
                  onViewMore={handleViewMore}
                  delay={index * 100}
                />
              ))}
            </div>
          </div>
        )}
        
        {savedInsightViews.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-dark-100 animate-fade-in mb-6" style={{ animationDelay: '430ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center">
                <Bookmark className="w-4 h-4 text-brand-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-dark-900">我的洞察视图</h3>
                <p className="text-sm text-dark-500 mt-0.5">
                  已保存 {savedInsightViews.length} 个热点内容筛选视图，点击可快速打开
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedInsightViews.slice(0, 6).map((view, index) => (
                <SavedInsightCard
                  key={view.id}
                  view={view}
                  onOpen={handleOpenInsightView}
                  onRemove={removeInsightView}
                  delay={index * 80}
                />
              ))}
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-dark-100 animate-fade-in" style={{ animationDelay: '450ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark-900">
              品牌竞品对比
            </h3>
            {isValidCustomRange && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportReport}
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                导出复盘报告
              </Button>
            )}
          </div>
          
          {isValidCustomRange ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-dark-500">品牌</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-dark-500">排名</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-dark-500">总声量</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-dark-500">份额</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-dark-500">环比</th>
                    {enabledPlatformList.map(p => (
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
                        {enabledPlatformList.map(p => {
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
          ) : (
            <div className="text-center py-12 text-dark-500">
              请选择有效的活动周期日期范围
            </div>
          )}
        </div>
      </main>
      
      <Modal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        title={
          selectedDate
            ? `${selectedDate} 热点内容`
            : '热点内容下钻'
        }
        size="xl"
      >
        <div className="space-y-4">
          {selectedDate ? (
            <>
              {postFilter && (
                <div className="p-4 bg-brand-50 rounded-xl border border-brand-100">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Filter className="w-4 h-4 text-brand-600" />
                      <span className="text-sm font-medium text-brand-900">当前筛选：</span>
                      <span className="text-xs px-2 py-1 bg-brand-100 text-brand-700 rounded-full">
                        平台：{PLATFORMS.find(p => p.key === postFilter.platform)?.name || postFilter.platform}
                      </span>
                      <span className="text-xs px-2 py-1 bg-brand-100 text-brand-700 rounded-full">
                        关键词：{postFilter.brandName}
                      </span>
                      <span className="text-xs px-2 py-1 bg-brand-100 text-brand-700 rounded-full">
                        日期：{postFilter.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setNewViewName('');
                          setShowSaveViewModal(true);
                        }}
                        className="text-brand-700 hover:text-brand-900 hover:bg-brand-100"
                      >
                        <BookmarkPlus className="w-4 h-4 mr-1" />
                        保存视图
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPostFilter(null);
                          resetFilters();
                        }}
                        className="text-brand-700 hover:text-brand-900 hover:bg-brand-100"
                      >
                        <X className="w-4 h-4 mr-1" />
                        清除筛选
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="p-4 bg-dark-50 rounded-xl space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-dark-500" />
                    <span className="text-sm font-medium text-dark-700">平台筛选</span>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setPlatformFilter('all')}
                        className={cn(
                          'px-3 py-1 text-xs font-medium rounded-full transition-all',
                          platformFilter === 'all'
                            ? 'bg-brand-500 text-white'
                            : 'bg-white text-dark-600 hover:bg-dark-100 border border-dark-200'
                        )}
                      >
                        全部
                      </button>
                      {postEnabledPlatforms.map((platformKey) => {
                        const platform = PLATFORMS.find(p => p.key === platformKey);
                        if (!platform) return null;
                        return (
                          <button
                            key={platformKey}
                            onClick={() => setPlatformFilter(platformKey)}
                            className={cn(
                              'px-3 py-1 text-xs font-medium rounded-full transition-all',
                              platformFilter === platformKey
                                ? 'text-white'
                                : 'bg-white text-dark-600 hover:bg-dark-100 border border-dark-200'
                            )}
                            style={platformFilter === platformKey ? { backgroundColor: platform.color } : {}}
                          >
                            {platform.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-success-600">
                      <span className="w-2 h-2 rounded-full bg-success-500" />
                      正面 {postsBySentiment.positive.length}
                    </span>
                    <span className="flex items-center gap-1 text-danger-600">
                      <span className="w-2 h-2 rounded-full bg-danger-500" />
                      负面 {postsBySentiment.negative.length}
                    </span>
                    <span className="flex items-center gap-1 text-dark-500">
                      <span className="w-2 h-2 rounded-full bg-dark-400" />
                      中性 {postsBySentiment.neutral.length}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-dark-700">情绪</span>
                    <div className="flex gap-2">
                      {(['all', 'positive', 'negative', 'neutral'] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setSentimentFilter(s)}
                          className={cn(
                            'px-3 py-1 text-xs font-medium rounded-full transition-all',
                            sentimentFilter === s
                              ? s === 'positive' ? 'bg-success-500 text-white' :
                                s === 'negative' ? 'bg-danger-500 text-white' :
                                s === 'neutral' ? 'bg-dark-500 text-white' :
                                'bg-brand-500 text-white'
                              : 'bg-white text-dark-600 hover:bg-dark-100 border border-dark-200'
                          )}
                        >
                          {s === 'all' ? '全部' : getSentimentLabel(s).text}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-dark-700">类型</span>
                    <div className="flex gap-2">
                      {(['all', 'ad', 'organic'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setTypeFilter(t)}
                          className={cn(
                            'px-3 py-1 text-xs font-medium rounded-full transition-all',
                            typeFilter === t
                              ? 'bg-warning-500 text-white'
                              : 'bg-white text-dark-600 hover:bg-dark-100 border border-dark-200'
                          )}
                        >
                          {t === 'all' ? '全部类型' : t === 'ad' ? '推广' : '自然'}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1 px-3 py-1 text-xs text-dark-500 hover:text-dark-700 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    重置筛选
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-dark-500" />
                  <span className="text-sm font-medium text-dark-700">排序</span>
                  <div className="flex gap-2">
                    {(['engagement', 'date', 'likes', 'comments', 'shares'] as SortField[]).map((field) => {
                      const labels: Record<SortField, string> = {
                        engagement: '总互动',
                        date: '发布时间',
                        likes: '点赞',
                        comments: '评论',
                        shares: '转发',
                      };
                      return (
                        <button
                          key={field}
                          onClick={() => {
                            if (sortField === field) {
                              toggleSortOrder();
                            } else {
                              setSortField(field);
                              setSortOrder('desc');
                            }
                          }}
                          className={cn(
                            'flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full transition-all',
                            sortField === field
                              ? 'bg-dark-700 text-white'
                              : 'bg-white text-dark-600 hover:bg-dark-100 border border-dark-200'
                          )}
                        >
                          {labels[field]}
                          {sortField === field && (
                            <span className="text-[10px]">
                              {sortOrder === 'desc' ? '↓' : '↑'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-dark-500">
                共 {filteredPosts.length} 条内容
              </div>
              
              {filteredPosts.length > 0 ? (
                <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-2">
                  {filteredPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      showContent={true}
                      getSentimentLabel={getSentimentLabel}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-dark-400" />
                  </div>
                  <p className="text-dark-500">暂无符合筛选条件的内容</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-brand-500" />
              </div>
              <p className="text-dark-700 font-medium mb-1">点击走势图中的数据点</p>
              <p className="text-dark-500 text-sm">查看当天拉动声量的具体内容</p>
            </div>
          )}
        </div>
      </Modal>
      
      <Modal
        isOpen={showSaveViewModal}
        onClose={() => setShowSaveViewModal(false)}
        title="保存洞察视图"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-dark-600">
            将当前筛选条件保存为洞察视图，方便后续快速打开查看
          </p>
          
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1.5">
              视图名称
            </label>
            <input
              type="text"
              value={newViewName}
              onChange={(e) => setNewViewName(e.target.value)}
              placeholder="例如：竞品A微博618当天讨论"
              className="w-full px-3 py-2 text-sm border border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              autoFocus
            />
          </div>
          
          <div className="p-3 bg-dark-50 rounded-lg space-y-2">
            <p className="text-xs text-dark-500">将保存的筛选条件：</p>
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs px-2 py-0.5 bg-white text-dark-700 rounded border border-dark-200">
                日期：{selectedDate || '-'}
              </span>
              <span className="text-xs px-2 py-0.5 bg-white text-dark-700 rounded border border-dark-200">
                平台：{platformFilter === 'all' ? '全部' : PLATFORMS.find(p => p.key === platformFilter)?.name || platformFilter}
              </span>
              <span className="text-xs px-2 py-0.5 bg-white text-dark-700 rounded border border-dark-200">
                关键词：{postFilter?.brandName || '-'}
              </span>
              {sentimentFilter !== 'all' && (
                <span className="text-xs px-2 py-0.5 bg-white text-dark-700 rounded border border-dark-200">
                  情绪：{sentimentFilter === 'positive' ? '正面' : sentimentFilter === 'negative' ? '负面' : '中性'}
                </span>
              )}
              {typeFilter !== 'all' && (
                <span className="text-xs px-2 py-0.5 bg-white text-dark-700 rounded border border-dark-200">
                  类型：{typeFilter === 'ad' ? '推广' : '自然'}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => setShowSaveViewModal(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleSaveView}
              disabled={!newViewName.trim()}
            >
              <Bookmark className="w-4 h-4 mr-1" />
              确认保存
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardPage;
