import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import Tasks from './pages/Tasks';
import OrgChartPage from './pages/OrgChart';
import BudgetPage from './pages/Budget';
import AuditPage from './pages/Audit';
import SettingsPage from './pages/Settings';
import Onboarding from './pages/Onboarding';
import { useAppStore } from './stores/appStore';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Command center overview' },
  '/agents': { title: 'Agents', subtitle: 'Manage your AI workforce' },
  '/tasks': { title: 'Tasks', subtitle: 'Track work across your company' },
  '/org': { title: 'Org Chart', subtitle: 'Company hierarchy' },
  '/budget': { title: 'Budget', subtitle: 'Cost monitoring & controls' },
  '/audit': { title: 'Audit Trail', subtitle: 'Full activity log' },
  '/settings': { title: 'Settings', subtitle: 'App configuration' },
};

function AppLayout() {
  const location = useLocation();
  const page = pageTitles[location.pathname] || pageTitles['/'];
  const { fetchCompanies, fetchAgents, fetchTasks, fetchBudget, fetchBudgetSummary, fetchAudit, fetchGoals, initWebSocket } = useAppStore();

  useEffect(() => {
    const init = async () => {
      await fetchCompanies();
      fetchAgents();
      fetchTasks();
      fetchBudget();
      fetchBudgetSummary();
      fetchAudit();
      fetchGoals();
      initWebSocket();
    };
    init();
  }, []);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Header title={page.title} subtitle={page.subtitle} />
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/org" element={<OrgChartPage />} />
            <Route path="/budget" element={<BudgetPage />} />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [onboarded, setOnboarded] = useState(() => {
    return localStorage.getItem('crewmatic_onboarded') === 'true';
  });

  const handleOnboardComplete = () => {
    localStorage.setItem('crewmatic_onboarded', 'true');
    setOnboarded(true);
  };

  if (!onboarded) {
    return <Onboarding onComplete={handleOnboardComplete} />;
  }

  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
