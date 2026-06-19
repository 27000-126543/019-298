import { ShareData, AbnormalSpike, PLATFORMS, DataSourceConfig } from '@/types';
import { formatNumber, formatPercent } from './numberUtils';

interface ExportDataParams {
  timeRangeLabel: string;
  dateRange: { start: string; end: string };
  dataSources: DataSourceConfig;
  enabledPlatformList: { key: string; name: string; color: string }[];
  brandRanking: ShareData[];
  competitorSpikes: AbnormalSpike[];
  brandName: string;
}

const escapeCSV = (value: string | number): string => {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const generateMarketReviewCSV = (params: ExportDataParams): string => {
  const {
    timeRangeLabel,
    dateRange,
    dataSources,
    enabledPlatformList,
    brandRanking,
    competitorSpikes,
    brandName,
  } = params;

  const rows: string[] = [];
  const timestamp = new Date().toLocaleString('zh-CN');
  
  rows.push(`声量竞品看板 - 市场复盘报告`);
  rows.push(`生成时间,${escapeCSV(timestamp)}`);
  rows.push(`导出品牌,${escapeCSV(brandName)}`);
  rows.push('');
  
  rows.push('=== 时间周期 ===');
  rows.push('周期类型,开始日期,结束日期');
  rows.push(`${escapeCSV(timeRangeLabel)},${escapeCSV(dateRange.start)},${escapeCSV(dateRange.end)}`);
  rows.push('');
  
  rows.push('=== 数据来源 ===');
  rows.push('来源,状态');
  const dsEntries: [string, boolean][] = [
    ['微博', dataSources.weibo],
    ['短视频', dataSources.shortVideo],
    ['新闻', dataSources.news],
    ['论坛', dataSources.forum],
  ];
  dsEntries.forEach(([name, enabled]) => {
    rows.push(`${escapeCSV(name)},${enabled ? '启用' : '关闭'}`);
  });
  rows.push('');
  
  rows.push('=== 品牌声量排名 ===');
  const rankHeader = ['排名', '品牌', '总声量', '份额', '环比增长'];
  enabledPlatformList.forEach(p => rankHeader.push(`${p.name}声量`));
  rows.push(rankHeader.join(','));
  
  const sortedRanking = [...brandRanking].sort((a, b) => b.totalVolume - a.totalVolume);
  sortedRanking.forEach((brand, index) => {
    const row: (string | number)[] = [
      index + 1,
      brand.brandName,
      formatNumber(brand.totalVolume),
      formatPercent(brand.share),
      `${brand.growth > 0.05 ? '+' : ''}${formatPercent(brand.growth)}`,
    ];
    enabledPlatformList.forEach(p => {
      const breakdown = brand.platformBreakdown.find(b => b.platform === p.key);
      row.push(breakdown ? formatNumber(breakdown.volume) : '-');
    });
    rows.push(row.map(escapeCSV).join(','));
  });
  rows.push('');
  
  rows.push('=== 平台增长明细 ===');
  rows.push('平台,品牌,当前声量,份额,环比增长');
  enabledPlatformList.forEach(platform => {
    sortedRanking.forEach(brand => {
      const breakdown = brand.platformBreakdown.find(b => b.platform === platform.key);
      if (breakdown) {
        rows.push([
          escapeCSV(platform.name),
          escapeCSV(brand.brandName),
          formatNumber(breakdown.volume),
          formatPercent(breakdown.share),
          `${breakdown.growth > 0.05 ? '+' : ''}${formatPercent(breakdown.growth)}`,
        ].map(escapeCSV).join(','));
      }
    });
    rows.push('');
  });
  
  if (competitorSpikes.length > 0) {
    rows.push('=== 竞品异常波动提醒 ===');
    rows.push('风险等级,竞品,平台,日期,当前声量,前日声量,增长率,推广内容,自然讨论,正面,中性,负面,主要驱动');
    competitorSpikes.forEach(spike => {
      const severityLabel = spike.severity === 'high' ? '高风险' : spike.severity === 'medium' ? '中风险' : '关注';
      const row: (string | number)[] = [
        severityLabel,
        spike.brandName,
        spike.platformName,
        spike.date,
        formatNumber(spike.volume),
        formatNumber(spike.previousVolume),
        `+${formatPercent(spike.growthRate)}`,
        spike.attribution.adCount,
        spike.attribution.organicCount,
        spike.attribution.sentiment.positive,
        spike.attribution.sentiment.neutral,
        spike.attribution.sentiment.negative,
        spike.attribution.topDrivers.join('、'),
      ];
      rows.push(row.map(escapeCSV).join(','));
    });
  }
  
  return '\ufeff' + rows.join('\n');
};

export const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
