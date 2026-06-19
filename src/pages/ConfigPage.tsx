import { useState, useEffect, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Save, RotateCcw, MessageCircle, PlayCircle, Newspaper, Users, Building2 } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tag } from '@/components/ui/Tag';
import { PLATFORMS } from '@/types';
import { cn } from '@/lib/utils';

const ConfigPage = () => {
  const navigate = useNavigate();
  const { config, updateBrand, addCompetitor, removeCompetitor, updateDataSources, saveConfig, loadConfig } = useAppStore();
  
  const [brandName, setBrandName] = useState('');
  const [aliasInput, setAliasInput] = useState('');
  const [productLineInput, setProductLineInput] = useState('');
  const [aliases, setAliases] = useState<string[]>([]);
  const [productLines, setProductLines] = useState<string[]>([]);
  
  const [newCompetitorName, setNewCompetitorName] = useState('');
  const [newCompetitorAlias, setNewCompetitorAlias] = useState('');
  const [competitorAliases, setCompetitorAliases] = useState<string[]>([]);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);
  
  useEffect(() => {
    if (config) {
      setBrandName(config.brand.name);
      setAliases(config.brand.aliases);
      setProductLines(config.brand.productLines);
    }
  }, [config]);
  
  const handleAddAlias = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && aliasInput.trim()) {
      e.preventDefault();
      if (!aliases.includes(aliasInput.trim())) {
        setAliases([...aliases, aliasInput.trim()]);
      }
      setAliasInput('');
    }
  };
  
  const handleRemoveAlias = (alias: string) => {
    setAliases(aliases.filter(a => a !== alias));
  };
  
  const handleAddProductLine = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && productLineInput.trim()) {
      e.preventDefault();
      if (!productLines.includes(productLineInput.trim())) {
        setProductLines([...productLines, productLineInput.trim()]);
      }
      setProductLineInput('');
    }
  };
  
  const handleRemoveProductLine = (line: string) => {
    setProductLines(productLines.filter(l => l !== line));
  };
  
  const handleAddCompetitorAlias = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newCompetitorAlias.trim()) {
      e.preventDefault();
      if (!competitorAliases.includes(newCompetitorAlias.trim())) {
        setCompetitorAliases([...competitorAliases, newCompetitorAlias.trim()]);
      }
      setNewCompetitorAlias('');
    }
  };
  
  const handleRemoveCompetitorAlias = (alias: string) => {
    setCompetitorAliases(competitorAliases.filter(a => a !== alias));
  };
  
  const handleAddCompetitor = () => {
    if (!newCompetitorName.trim()) {
      setErrors(prev => ({ ...prev, competitor: '请输入竞品品牌名称' }));
      return;
    }
    
    if (config && config.competitors.length >= 3) {
      setErrors(prev => ({ ...prev, competitor: '最多只能添加 3 个竞品' }));
      return;
    }
    
    addCompetitor({
      name: newCompetitorName.trim(),
      aliases: [...competitorAliases],
    });
    
    setNewCompetitorName('');
    setNewCompetitorAlias('');
    setCompetitorAliases([]);
    setErrors(prev => {
      const { competitor, ...rest } = prev;
      return rest;
    });
  };
  
  const handleDataSourceToggle = (key: string) => {
    if (!config) {
      updateDataSources({ [key]: true });
      return;
    }
    
    const currentValue = config.dataSources[key as keyof typeof config.dataSources];
    updateDataSources({ [key]: !currentValue });
  };
  
  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    
    if (!brandName.trim()) {
      newErrors.brandName = '请输入品牌名称';
    }
    
    if (!config || config.competitors.length === 0) {
      newErrors.competitor = '请至少添加一个竞品品牌';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    updateBrand({
      name: brandName.trim(),
      aliases,
      productLines,
    });
    
    setTimeout(() => {
      const success = saveConfig();
      if (success) {
        navigate('/dashboard');
      }
    }, 100);
  };
  
  const handleReset = () => {
    setBrandName('');
    setAliases([]);
    setProductLines([]);
    setNewCompetitorName('');
    setCompetitorAliases([]);
    setErrors({});
    
    if (config) {
      updateBrand({
        name: '',
        aliases: [],
        productLines: [],
      });
      config.competitors.forEach(c => removeCompetitor(c.id));
    }
  };
  
  const platformIcons: Record<string, React.ReactNode> = {
    weibo: <MessageCircle className="w-5 h-5" />,
    shortVideo: <PlayCircle className="w-5 h-5" />,
    news: <Newspaper className="w-5 h-5" />,
    forum: <Users className="w-5 h-5" />,
  };
  
  return (
    <div className="min-h-screen bg-dark-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10 animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-dark-900 mb-2">配置品牌与竞品</h1>
          <p className="text-dark-500 max-w-md mx-auto">
            设置您的品牌信息和竞品，系统将自动抓取全网讨论数据进行对比分析
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-dark-100 animate-slide-up">
            <h2 className="text-lg font-semibold text-dark-900 mb-4 flex items-center gap-2">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: config?.brand.color || '#3B82F6' }}
              >
                1
              </span>
              品牌信息
            </h2>
            
            <div className="space-y-4">
              <Input
                label="品牌名称 *"
                placeholder="例如：小米"
                value={brandName}
                onChange={(e) => {
                  setBrandName(e.target.value);
                  if (errors.brandName) {
                    setErrors(prev => {
                      const { brandName, ...rest } = prev;
                      return rest;
                    });
                  }
                }}
                error={errors.brandName}
              />
              
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">
                  常见简称
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {aliases.map((alias, index) => (
                    <Tag key={index} variant="primary" removable onRemove={() => handleRemoveAlias(alias)}>
                      {alias}
                    </Tag>
                  ))}
                </div>
                <Input
                  placeholder="输入简称后按 Enter 添加，例如：MI、米粉"
                  value={aliasInput}
                  onChange={(e) => setAliasInput(e.target.value)}
                  onKeyDown={handleAddAlias}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">
                  产品线名称
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {productLines.map((line, index) => (
                    <Tag key={index} variant="default" removable onRemove={() => handleRemoveProductLine(line)}>
                      {line}
                    </Tag>
                  ))}
                </div>
                <Input
                  placeholder="输入产品线后按 Enter 添加，例如：小米手机、小米电视"
                  value={productLineInput}
                  onChange={(e) => setProductLineInput(e.target.value)}
                  onKeyDown={handleAddProductLine}
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-dark-100 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-lg font-semibold text-dark-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-warning-500 flex items-center justify-center text-xs font-bold text-white">
                2
              </span>
              竞品品牌
              <span className="text-sm font-normal text-dark-500">
                (最多 3 个)
              </span>
            </h2>
            
            {config && config.competitors.length > 0 && (
              <div className="space-y-3 mb-6">
                {config.competitors.map((competitor, index) => (
                  <div
                    key={competitor.id}
                    className="flex items-center justify-between p-4 bg-dark-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: competitor.color }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-dark-900">{competitor.name}</p>
                        {competitor.aliases.length > 0 && (
                          <p className="text-xs text-dark-500 mt-0.5">
                            简称: {competitor.aliases.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeCompetitor(competitor.id)}
                      className="p-2 text-dark-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {config && config.competitors.length < 3 && (
              <div className="space-y-4 p-4 border-2 border-dashed border-dark-200 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="竞品品牌名称 *"
                    placeholder="例如：华为"
                    value={newCompetitorName}
                    onChange={(e) => {
                      setNewCompetitorName(e.target.value);
                      if (errors.competitor) {
                        setErrors(prev => {
                          const { competitor, ...rest } = prev;
                          return rest;
                        });
                      }
                    }}
                    error={errors.competitor}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1.5">
                      竞品简称
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {competitorAliases.map((alias, index) => (
                        <Tag key={index} variant="default" removable onRemove={() => handleRemoveCompetitorAlias(alias)}>
                          {alias}
                        </Tag>
                      ))}
                    </div>
                    <Input
                      placeholder="输入简称后按 Enter 添加"
                      value={newCompetitorAlias}
                      onChange={(e) => setNewCompetitorAlias(e.target.value)}
                      onKeyDown={handleAddCompetitorAlias}
                    />
                  </div>
                </div>
                
                <Button
                  variant="secondary"
                  onClick={handleAddCompetitor}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  添加竞品
                </Button>
              </div>
            )}
            
            {config && config.competitors.length >= 3 && (
              <div className="p-4 bg-warning-50 border border-warning-200 rounded-xl text-sm text-warning-700">
                已达到最大竞品数量限制（3 个）。如需修改，请先删除现有竞品。
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-dark-100 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <h2 className="text-lg font-semibold text-dark-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-success-500 flex items-center justify-center text-xs font-bold text-white">
                3
              </span>
              数据来源
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PLATFORMS.map((platform) => {
                const isSelected = config?.dataSources[platform.key as keyof typeof config.dataSources] ?? true;
                return (
                  <button
                    key={platform.key}
                    onClick={() => handleDataSourceToggle(platform.key)}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all duration-200 text-left',
                      isSelected
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-dark-200 bg-white hover:border-dark-300'
                    )}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                      style={{
                        backgroundColor: isSelected ? `${platform.color}20` : '#F1F5F9',
                        color: isSelected ? platform.color : '#64748B',
                      }}
                    >
                      {platformIcons[platform.key]}
                    </div>
                    <p className="font-medium text-dark-900">{platform.name}</p>
                    <p className="text-xs text-dark-500 mt-1">
                      {isSelected ? '已启用' : '已禁用'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <Button variant="ghost" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              重置
            </Button>
            
            <Button size="lg" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              保存配置并查看看板
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigPage;
