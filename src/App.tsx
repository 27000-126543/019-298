import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ConfigPage from '@/pages/ConfigPage';
import DashboardPage from '@/pages/DashboardPage';
import DetailsPage from '@/pages/DetailsPage';
import { useAppStore } from '@/store/appStore';

const App = () => {
  const { isConfigured, loadConfig, loadInsightViews } = useAppStore();
  
  useEffect(() => {
    loadConfig();
    loadInsightViews();
  }, [loadConfig, loadInsightViews]);
  
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isConfigured) {
      return <Navigate to="/config" replace />;
    }
    return <>{children}</>;
  };
  
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isConfigured ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/config" replace />
            )
          }
        />
        <Route path="/config" element={<ConfigPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/details"
          element={
            <ProtectedRoute>
              <DetailsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
