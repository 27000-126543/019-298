import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, TrendingUp, AlertTriangle, BarChart3, ChevronDown, X, Filter, ArrowUpDown, RotateCcw } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useVolumeData } from '@/hooks/useVolumeData';
import { useShareData } from '@/hooks/useShareData';
import { usePostContent } from '@/hooks/usePostContent';
import { useAbnormalSpikes } from '@/hooks/useAbnormalSpikes';
import { Header } from '@/components/layout/Header';
import { SharePieChart } from '@/components/charts/SharePieChart';
import { PlatformGrowthCard } from '@/components/cards/PlatformGrowthCard';
import { PostCard } from '@/components/cards/PostCard';
import { AbnormalSpikeCard } from '@/components/cards/AbnormalSpikeCard';
import { VolumeTrendChart } from '@/components/charts/VolumeTrendChart';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { Modal } from '@/components/ui/Modal';
import { TimeRange, PLATFORMS, SortField } from '@/types';
import { formatDateCN } from '@/utils/dateUtils';
import { formatNumber, formatPercent } from '@/utils/numberUtils';
import { cn } from '@/lib/utils';

const DetailsPage = () => {
  const navigate = useNavigate();
  const { config, timeRange, setTimeRange, customDateRange, setCustomDateRange, selectedDate, setSelectedDate } = useAppStore();
  const { brandData, currentRange, enabledPlatforms } = useVolumeData();
  const { shareData, topGrowthPlatforms, decliningPlatforms, platformGrowth, enabledPlatformList } = useShareData();
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
  
  const isValidCustomRange = timeRange !== 'custom' || (
    customDateRange?.start && 
    customDateRange?.end && 
    customDateRange.start <= customDateRange.end
  );
  
  const canDisplayDate = timeRange !== 'custom' || isValidCustomRange;
  
  const [showPostModal, setShowPostModal] = useState(false);
  
  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: 'yesterday', label: '昨天' },
    { value: '7days', label: '近 7 天' },
    { value: 'custom', label: '活动周期' },
  ];
  
  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    if (range !== 'custom') {
      setCustomDateRange(null);
    }
  };
  
  const handleChartPointClick = (date: string) => {
    setSelectedDate(date);
    setShowPostModal(true);
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
            <h1 className="text-2xl font-bold text-dark-900">详情分析</h1>
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
                  value={customDateRange?.start || ''}
                  onChange={(e) => setCustomDateRange({
                    start: e.target.value,
                    end: customDateRange?.end || e.target.value,
                  })}
                  className="px-3 py-2 text-sm border border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <span className="text-dark-500">至</span>
                <input
                  type="date"
                  value={customDateRange?.end || ''}
                  onChange={(e) => setCustomDateRange({
                    start: customDateRange?.start || e.target.value,
                    end: e.target.value,
                  })}
                  className="px-3 py-2 text-sm border border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            )}
            
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              <BarChart3 className="w-4 h-4 mr-2" />
              返回看板
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-dark-100 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-dark-900">
                  品牌声量份额
                </h3>
                <p className="text-sm text-dark-500 mt-1">
                  各品牌在选定周期内的声量占比
                </p>
              </div>
            </div>
            {isValidCustomRange ? (
              <SharePieChart
                data={shareData}
                height={350}
                showCenterLabel={true}
              />
            ) : (
              <div className="flex items-center justify-center h-[350px] text-dark-500">
                请选择有效的活动周期日期范围
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-dark-100 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-brand-600" />
              </div>
              <h3 className="text-lg font-semibold text-dark-900">各品牌数据</h3>
            </div>
            
            {isValidCustomRange ? (
              <div className="space-y-3">
                {shareData.map((brand, index) => {
                  const isMyBrand = brand.brandId === config.brand.id;
                  return (
                    <div
                      key={brand.brandId}
                      className={cn(
                        'p-4 rounded-xl transition-all',
                        isMyBrand ? 'bg-brand-50 border border-brand-200' : 'bg-dark-50'
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: brand.color }}
                          />
                          <span className={cn(
                            'font-medium',
                            isMyBrand ? 'text-brand-700' : 'text-dark-900'
                          )}>
                            {brand.brandName}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-dark-900">
                          {formatPercent(brand.share)}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-dark-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${brand.share * 100}%`,
                            backgroundColor: brand.color,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <span className="text-dark-500">
                          声量: {formatNumber(brand.totalVolume)}
                        </span>
                        <span className={cn(
                          'font-medium',
                          brand.growth > 0.05 ? 'text-success-600' :
                          brand.growth < -0.05 ? 'text-danger-600' :
                          'text-dark-500'
                        )}>
                          {brand.growth > 0.05 ? '+' : ''}{formatPercent(brand.growth)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-dark-500">
                请选择有效的活动周期日期范围
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-dark-100 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-success-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-success-600" />
              </div>
              <h3 className="text-lg font-semibold text-dark-900">增长最快平台</h3>
            </div>
            
            {!isValidCustomRange ? (
              <div className="text-center py-8 text-dark-500">
                请选择有效的活动周期日期范围
              </div>
            ) : topGrowthPlatforms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {topGrowthPlatforms.map((platform, index) => (
                  <PlatformGrowthCard
                    key={platform.platform}
                    data={platform}
                    type="growth"
                    delay={index * 100}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-dark-500">
                暂无显著增长的平台
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-dark-100 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-danger-50 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-danger-600" />
              </div>
              <h3 className="text-lg font-semibold text-dark-900">下滑渠道预警</h3>
            </div>
            
            {!isValidCustomRange ? (
              <div className="text-center py-8 text-dark-500">
                请选择有效的活动周期日期范围
              </div>
            ) : decliningPlatforms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {decliningPlatforms.map((platform, index) => (
                  <PlatformGrowthCard
                    key={platform.platform}
                    data={platform}
                    type="decline"
                    delay={index * 100}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-dark-500">
                暂无明显下滑的渠道
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-dark-100 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-dark-900">
                  {config.brand.name} 声量走势
                </h3>
                <p className="text-sm text-dark-500 mt-1">
                  点击数据点查看当天热点内容
                </p>
              </div>
              
              {selectedDate && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowPostModal(true)}
                >
                  {selectedDate} 热点内容
                </Button>
              )}
            </div>
            
            {brandData && isValidCustomRange ? (
              <VolumeTrendChart
                data={brandData}
                showArea={true}
                height={300}
                onPointClick={handleChartPointClick}
                enabledPlatforms={enabledPlatforms}
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
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-dark-100 animate-fade-in" style={{ animationDelay: '500ms' }}>
            <h3 className="text-lg font-semibold text-dark-900 mb-4">平台增长明细</h3>
            
            {!isValidCustomRange ? (
              <div className="text-center py-8 text-dark-500">
                请选择有效的活动周期日期范围
              </div>
            ) : (
              <div className="space-y-3">
                {platformGrowth.map((pg) => {
                  const platform = enabledPlatformList.find(p => p.key === pg.platform);
                  return (
                    <div key={pg.platform} className="p-3 bg-dark-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: platform?.color }}
                          />
                          <span className="font-medium text-dark-900">{pg.platformName}</span>
                        </div>
                        <span className={cn(
                          'font-mono font-bold',
                          pg.trend === 'up' ? 'text-success-600' :
                          pg.trend === 'down' ? 'text-danger-600' :
                          'text-dark-500'
                        )}>
                          {pg.growthRate > 0 ? '+' : ''}{formatPercent(pg.growthRate)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-dark-500">
                        <span>当前: {formatNumber(pg.currentVolume)}</span>
                        <span>上期: {formatNumber(pg.previousVolume)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      
      {competitorSpikes.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-dark-100 animate-fade-in" style={{ animationDelay: '550ms' }}>
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
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      )}
      
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
    </div>
  );
};

export default DetailsPage;
