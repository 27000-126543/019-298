const STORAGE_KEY = 'soundboard_config';
const INSIGHT_VIEWS_KEY = 'soundboard_insight_views';

export const storage = {
  getConfig: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setConfig: (config: unknown) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      return true;
    } catch {
      return false;
    }
  },

  clearConfig: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch {
      return false;
    }
  },

  hasConfig: () => {
    return localStorage.getItem(STORAGE_KEY) !== null;
  },

  getInsightViews: () => {
    try {
      const data = localStorage.getItem(INSIGHT_VIEWS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  setInsightViews: (views: unknown) => {
    try {
      localStorage.setItem(INSIGHT_VIEWS_KEY, JSON.stringify(views));
      return true;
    } catch {
      return false;
    }
  },
};
