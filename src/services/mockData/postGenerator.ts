import { PostContent, PLATFORMS } from '@/types';
import { generateId } from '@/utils/numberUtils';

const postTemplates = {
  positive: [
    { title: '{brand}新品发布，颜值与实力并存！', content: '终于等到了！{brand}这次的新品真的太惊艳了，设计感满满，使用体验也超棒~' },
    { title: '{brand}这次真的用心了，必须点赞', content: '用了{brand}的产品快一个月了，真心觉得不错，推荐给大家！' },
    { title: '被{brand}种草了，真香警告', content: '之前还犹豫要不要买{brand}，入手之后发现真的太香了，后悔没早买！' },
    { title: '{brand} × 知名设计师联名款曝光', content: '刚刚刷到{brand}和知名设计师的联名款，这设计也太好看了吧，钱包要空了！' },
    { title: '{brand}品牌618活动攻略来啦', content: '整理了{brand}今年618的全部优惠活动，帮大家省出一个亿！' },
  ],
  negative: [
    { title: '{brand}这次让人有点失望...', content: '期待了很久的{brand}新品终于收到了，但是体验和预期差很多，希望能改进。' },
    { title: '{brand}客服态度堪忧，投诉无门', content: '遇到问题找{brand}客服，推来推去就是不解决，真的很闹心。' },
    { title: '{brand}品控下滑，买需谨慎', content: '连续买了两个{brand}的产品都有小问题，以前不是这样的，有点失望。' },
    { title: '{brand}被曝虚假宣传，实测差距大', content: '{brand}的广告说得天花乱坠，实际用起来完全不是那么回事，大家小心避坑。' },
  ],
  neutral: [
    { title: '{brand}最新季度财报解读', content: '{brand}发布了最新季度财报，营收同比增长15%，一起来看看详细数据。' },
    { title: '{brand}高管变动，原CEO离职', content: '业内消息，{brand}原CEO因个人原因离职，新任CEO背景揭秘。' },
    { title: '深度对比：{brand} vs {competitor}', content: '今天来对比一下{brand}和{competitor}的最新旗舰产品，看看哪个更值得买。' },
    { title: '{brand}新品发布会定档下月', content: '官方确认{brand}新品发布会将于下月15日举行，届时将发布全新产品线。' },
  ],
  ad: [
    { title: '{brand}618狂欢，全场低至5折', content: '{brand}官方旗舰店618大促！前1小时折上折，还有限量赠品等你来抢！' },
    { title: '{brand}旗舰新品，今日开启预售', content: '{brand}2024年度旗舰新品正式发布，现在预约享专属好礼，点击查看详情→' },
    { title: '{brand}超级品牌日，限时特惠', content: '{brand}超级品牌日来袭！爆款单品直降千元，更有满减优惠券叠加使用！' },
  ],
};

const authors = [
  { name: '数码测评达人', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' },
  { name: '时尚生活家', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' },
  { name: '科技前沿站', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' },
  { name: '品牌研究社', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4' },
  { name: '消费者报道', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5' },
  { name: '热门榜单', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6' },
  { name: '好物推荐官', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=7' },
  { name: '行业观察', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=8' },
];

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const replacePlaceholders = (text: string, brand: string, competitor?: string): string => {
  let result = text.replace(/{brand}/g, brand);
  if (competitor) {
    result = result.replace(/{competitor}/g, competitor);
  }
  return result;
};

export const generatePostContent = (
  brandName: string,
  competitorNames: string[],
  date: string,
  count = 8
): PostContent[] => {
  const posts: PostContent[] = [];
  const dateObj = new Date(date);
  const baseTime = dateObj.getTime();
  
  for (let i = 0; i < count; i++) {
    const isAd = Math.random() < 0.25;
    let sentiment: 'positive' | 'negative' | 'neutral';
    
    if (isAd) {
      sentiment = 'positive';
    } else {
      const rand = Math.random();
      if (rand < 0.5) sentiment = 'positive';
      else if (rand < 0.7) sentiment = 'neutral';
      else sentiment = 'negative';
    }
    
    const templates = isAd ? postTemplates.ad : postTemplates[sentiment];
    const template = getRandomItem(templates);
    const competitor = getRandomItem(competitorNames);
    const author = getRandomItem(authors);
    const platform = getRandomItem(PLATFORMS);
    
    const publishTime = baseTime + Math.floor(Math.random() * 86400000);
    const likes = Math.floor(100 + Math.random() * 5000);
    const comments = Math.floor(10 + Math.random() * 500);
    const shares = Math.floor(5 + Math.random() * 200);
    
    posts.push({
      id: generateId(),
      title: replacePlaceholders(template.title, brandName, competitor),
      content: replacePlaceholders(template.content, brandName, competitor),
      author: author.name,
      authorAvatar: author.avatar,
      platform: platform.key,
      publishTime,
      sentiment,
      url: `https://example.com/post/${generateId()}`,
      engagement: { likes, comments, shares },
      isAd,
    });
  }
  
  return posts.sort((a, b) => 
    b.engagement.likes + b.engagement.comments + b.engagement.shares -
    a.engagement.likes - a.engagement.comments - a.engagement.shares
  );
};
