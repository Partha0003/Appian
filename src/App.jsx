import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import CaseIntelligenceExplorer from './pages/CaseIntelligenceExplorer';
import BottleneckAnalysis from './pages/BottleneckAnalysis';
import WhatIfSimulation from './pages/WhatIfSimulation';
import RecommendationsPlanner from './pages/RecommendationsPlanner';
import ReportsInsights from './pages/ReportsInsights';
import { loadData } from './utils/dataLoader';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const loadedData = await loadData();
      setData(loadedData);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-700 mx-auto mb-4"></div>
          <p className="text-primary-700 text-lg font-medium">Loading Operations Intelligence Data...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<ExecutiveDashboard data={data} />} />
            <Route path="/cases" element={<CaseIntelligenceExplorer data={data} />} />
            <Route path="/bottlenecks" element={<BottleneckAnalysis data={data} />} />
            <Route path="/simulation" element={<WhatIfSimulation data={data} />} />
            <Route path="/recommendations" element={<RecommendationsPlanner data={data} />} />
            <Route path="/reports" element={<ReportsInsights data={data} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

