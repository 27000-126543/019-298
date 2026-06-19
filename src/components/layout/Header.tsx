import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, Settings, TrendingUp } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { config } = useAppStore();
  
  const navItems = [
    { path: '/dashboard', label: '声量看板', icon: BarChart3 },
    { path: '/details', label: '详情分析', icon: TrendingUp },
  ];
  
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-dark-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/dashboard')}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-dark-900">声量看板</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-dark-600 hover:text-dark-900 hover:bg-dark-50'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            {config && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-brand-50 rounded-lg">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: config.brand.color }}
                />
                <span className="text-sm font-medium text-brand-700">
                  {config.brand.name}
                </span>
              </div>
            )}
            
            <button
              onClick={() => navigate('/config')}
              className="p-2 rounded-lg text-dark-600 hover:text-dark-900 hover:bg-dark-100 transition-colors"
              title="配置设置"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
