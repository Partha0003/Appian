import { useState, useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
  High: '#dc2626',
  Medium: '#f59e0b',
  Low: '#10b981',
};

export default function ExecutiveDashboard({ data }) {
  const [filters, setFilters] = useState({
    queueName: '',
    caseType: '',
    riskLevel: '',
    dayOfWeek: '',
    hourOfDay: '',
  });

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filters.queueName && item.Queue_Name !== filters.queueName) return false;
      if (filters.caseType && item.Case_Type !== filters.caseType) return false;
      if (filters.riskLevel && item.Risk_Level !== filters.riskLevel) return false;
      if (filters.dayOfWeek !== '' && item.Day_Of_Week !== parseInt(filters.dayOfWeek)) return false;
      if (filters.hourOfDay !== '' && item.Arrival_Hour !== parseInt(filters.hourOfDay)) return false;
      return true;
    });
  }, [data, filters]);

  const kpis = useMemo(() => {
    const total = filteredData.length;
    const high = filteredData.filter(d => d.Risk_Level === 'High').length;
    const medium = filteredData.filter(d => d.Risk_Level === 'Medium').length;
    const low = filteredData.filter(d => d.Risk_Level === 'Low').length;
    const avgTimeToBreach = filteredData
      .filter(d => d.Estimated_Time_To_Breach_Mins !== null)
      .reduce((sum, d) => sum + d.Estimated_Time_To_Breach_Mins, 0) / 
      filteredData.filter(d => d.Estimated_Time_To_Breach_Mins !== null).length || 0;

    return { total, high, medium, low, avgTimeToBreach };
  }, [filteredData]);

  const slaRiskDistribution = useMemo(() => {
    const distribution = filteredData.reduce((acc, item) => {
      acc[item.Risk_Level] = (acc[item.Risk_Level] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const bottleneckDistribution = useMemo(() => {
    const distribution = filteredData.reduce((acc, item) => {
      const bottleneck = item.Operational_Bottleneck || 'None';
      acc[bottleneck] = (acc[bottleneck] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const recommendedActions = useMemo(() => {
    const actions = filteredData.reduce((acc, item) => {
      const action = item.Recommended_Action || 'No action needed';
      acc[action] = (acc[action] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(actions).slice(0, 5).map(([action, count]) => ({ action, count }));
  }, [filteredData]);

  const uniqueQueues = [...new Set(data.map(d => d.Queue_Name))].sort();
  const uniqueCaseTypes = [...new Set(data.map(d => d.Case_Type))].sort();
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Executive Dashboard</h1>
        <p className="text-slate-600">High-level overview of operational intelligence and risk metrics</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Queue Name</label>
            <select
              value={filters.queueName}
              onChange={(e) => setFilters({ ...filters, queueName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Queues</option>
              {uniqueQueues.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Case Type</label>
            <select
              value={filters.caseType}
              onChange={(e) => setFilters({ ...filters, caseType: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Types</option>
              {uniqueCaseTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Risk Level</label>
            <select
              value={filters.riskLevel}
              onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Levels</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Day of Week</label>
            <select
              value={filters.dayOfWeek}
              onChange={(e) => setFilters({ ...filters, dayOfWeek: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Days</option>
              {daysOfWeek.map((day, idx) => <option key={idx} value={idx}>{day}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Hour of Day</label>
            <select
              value={filters.hourOfDay}
              onChange={(e) => setFilters({ ...filters, hourOfDay: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Hours</option>
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{i}:00</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-slate-600 mb-1">Total Cases</div>
          <div className="text-3xl font-bold text-slate-800">{kpis.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="text-sm text-slate-600 mb-1">High Risk Cases</div>
          <div className="text-3xl font-bold text-red-600">{kpis.high}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="text-sm text-slate-600 mb-1">Medium Risk Cases</div>
          <div className="text-3xl font-bold text-yellow-600">{kpis.medium}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="text-sm text-slate-600 mb-1">Low Risk Cases</div>
          <div className="text-3xl font-bold text-green-600">{kpis.low}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-slate-600 mb-1">Avg Time to Breach</div>
          <div className="text-3xl font-bold text-slate-800">{Math.round(kpis.avgTimeToBreach)} min</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">SLA Risk Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={slaRiskDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {slaRiskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#8884d8'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Bottleneck Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bottleneckDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#334e68" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommended Actions Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Top Recommended Actions</h2>
        <div className="space-y-3">
          {recommendedActions.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
              <span className="text-slate-700">{item.action}</span>
              <span className="px-3 py-1 bg-primary-600 text-white rounded-full text-sm font-medium">
                {item.count} cases
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

