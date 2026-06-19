import { create } from 'zustand';
import { AppConfig, BrandConfig, CompetitorConfig, DataSourceConfig, TimeRange, DateRange } from '@/types';
import { storage } from '@/services/storage';
import { generateId } from '@/utils/numberUtils';

interface PostContentFilter {
  platform: string;
  brandName: string;
  date: string;
}

interface AppState {
  config: AppConfig | null;
  timeRange: TimeRange;
  customDateRange: DateRange | null;
  selectedDate: string | null;
  isConfigured: boolean;
  postFilter: PostContentFilter | null;
  
  setConfig: (config: AppConfig) => void;
  updateBrand: (brand: Partial<BrandConfig>) => void;
  addCompetitor: (competitor: Omit<CompetitorConfig, 'id' | 'color'>) => void;
  updateCompetitor: (id: string, competitor: Partial<CompetitorConfig>) => void;
  removeCompetitor: (id: string) => void;
  updateDataSources: (sources: Partial<DataSourceConfig>) => void;
  saveConfig: () => boolean;
  loadConfig: () => void;
  clearConfig: () => void;
  
  setTimeRange: (range: TimeRange) => void;
  setCustomDateRange: (range: DateRange | null) => void;
  setSelectedDate: (date: string | null) => void;
  setPostFilter: (filter: PostContentFilter | null) => void;
}

const DEFAULT_DATA_SOURCES: DataSourceConfig = {
  weibo: true,
  shortVideo: true,
  news: true,
  forum: true,
};

export const useAppStore = create<AppState>((set, get) => ({
  config: null,
  timeRange: '7days',
  customDateRange: null,
  selectedDate: null,
  isConfigured: false,
  postFilter: null,

  setConfig: (config) => set({ config, isConfigured: true }),

  updateBrand: (brand) => set((state) => {
    if (!state.config) {
      const newBrand: BrandConfig = {
        id: generateId(),
        name: brand.name || '',
        aliases: brand.aliases || [],
        productLines: brand.productLines || [],
        color: '#3B82F6',
      };
      return {
        config: {
          brand: newBrand,
          competitors: [],
          dataSources: DEFAULT_DATA_SOURCES,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      };
    }
    return {
      config: {
        ...state.config,
        brand: { ...state.config.brand, ...brand },
        updatedAt: Date.now(),
      },
    };
  }),

  addCompetitor: (competitor) => set((state) => {
    let currentConfig = state.config;
    
    if (!currentConfig) {
      currentConfig = {
        brand: {
          id: generateId(),
          name: '',
          aliases: [],
          productLines: [],
          color: '#3B82F6',
        },
        competitors: [],
        dataSources: DEFAULT_DATA_SOURCES,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }
    
    if (currentConfig.competitors.length >= 3) return state;
    
    const colors = ['#8B5CF6', '#F97316', '#06B6D4'];
    const newCompetitor: CompetitorConfig = {
      id: generateId(),
      name: competitor.name,
      aliases: competitor.aliases || [],
      color: colors[currentConfig.competitors.length] || '#8B5CF6',
    };
    
    return {
      config: {
        ...currentConfig,
        competitors: [...currentConfig.competitors, newCompetitor],
        updatedAt: Date.now(),
      },
    };
  }),

  updateCompetitor: (id, competitor) => set((state) => {
    if (!state.config) return state;
    return {
      config: {
        ...state.config,
        competitors: state.config.competitors.map(c =>
          c.id === id ? { ...c, ...competitor } : c
        ),
        updatedAt: Date.now(),
      },
    };
  }),

  removeCompetitor: (id) => set((state) => {
    if (!state.config) return state;
    return {
      config: {
        ...state.config,
        competitors: state.config.competitors.filter(c => c.id !== id),
        updatedAt: Date.now(),
      },
    };
  }),

  updateDataSources: (sources) => set((state) => {
    if (!state.config) {
      return {
        config: {
          brand: {
            id: generateId(),
            name: '',
            aliases: [],
            productLines: [],
            color: '#3B82F6',
          },
          competitors: [],
          dataSources: { ...DEFAULT_DATA_SOURCES, ...sources },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      };
    }
    return {
      config: {
        ...state.config,
        dataSources: { ...state.config.dataSources, ...sources },
        updatedAt: Date.now(),
      },
    };
  }),

  saveConfig: () => {
    const { config } = get();
    if (!config || !config.brand.name || config.competitors.length === 0) {
      return false;
    }
    const success = storage.setConfig(config);
    if (success) {
      set({ isConfigured: true });
    }
    return success;
  },

  loadConfig: () => {
    const config = storage.getConfig();
    if (config) {
      set({ config, isConfigured: true });
    }
  },

  clearConfig: () => {
    storage.clearConfig();
    set({ config: null, isConfigured: false });
  },

  setTimeRange: (range) => set({ timeRange: range }),
  setCustomDateRange: (range) => set({ customDateRange: range }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setPostFilter: (filter) => set({ postFilter: filter }),
}));
