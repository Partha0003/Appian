import { useState, useMemo } from 'react';

const COLORS = {
  High: '#dc2626',
  Medium: '#f59e0b',
  Low: '#10b981',
};

export default function RecommendationsPlanner({ data }) {
  const [groupBy, setGroupBy] = useState('queue');
  const [filterRisk, setFilterRisk] = useState('all');

  const groupedActions = useMemo(() => {
    let filtered = data;
    
    if (filterRisk !== 'all') {
      filtered = filtered.filter(d => d.Risk_Level === filterRisk);
    }

    const grouped = {};
    
    filtered.forEach(item => {
      const action = item.Recommended_Action || 'No action needed';
      let key;
      
      if (groupBy === 'queue') {
        key = item.Queue_Name;
      } else if (groupBy === 'risk') {
        key = item.Risk_Level;
      } else if (groupBy === 'bottleneck') {
        key = item.Operational_Bottleneck || 'None';
      } else {
        key = action;
      }
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });

    return Object.entries(grouped)
      .map(([key, items]) => ({
        group: key,
        items: items.sort((a, b) => b.Predicted_SLA_Risk - a.Predicted_SLA_Risk),
        totalCases: items.length,
        highRisk: items.filter(i => i.Risk_Level === 'High').length,
        avgRiskReduction: items.reduce((sum, i) => sum + (i.Predicted_SLA_Risk - i.Expected_Risk_After_Action), 0) / items.length,
      }))
      .sort((a, b) => b.highRisk - a.highRisk);
  }, [data, groupBy, filterRisk]);

  const getConfidenceLevel = (item) => {
    const riskReduction = item.Predicted_SLA_Risk - item.Expected_Risk_After_Action;
    if (riskReduction > 40) return { level: 'High', color: 'green' };
    if (riskReduction > 20) return { level: 'Medium', color: 'yellow' };
    return { level: 'Low', color: 'red' };
  };

  const exportReport = () => {
    const csvContent = [
      ['Case ID', 'Queue', 'Case Type', 'Current Risk %', 'Risk Level', 'Recommended Action', 'Expected Risk After Action %', 'Risk Reduction %', 'Time to Breach'],
      ...data
        .filter(item => item.Recommended_Action && item.Recommended_Action !== 'No action needed')
        .map(item => [
          item.Case_ID,
          item.Queue_Name,
          item.Case_Type,
          item.Predicted_SLA_Risk.toFixed(1),
          item.Risk_Level,
          item.Recommended_Action,
          item.Expected_Risk_After_Action.toFixed(1),
          (item.Predicted_SLA_Risk - item.Expected_Risk_After_Action).toFixed(1),
          item.Estimated_Time_To_Breach_Mins || 'N/A',
        ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'action_plan_report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Recommendations & Action Planner</h1>
          <p className="text-slate-600">AI-recommended actions organized for operational decision support</p>
        </div>
        <button
          onClick={exportReport}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          📥 Download Action Report
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Group By</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="queue">Queue Name</option>
              <option value="risk">Risk Level</option>
              <option value="bottleneck">Bottleneck Type</option>
              <option value="action">Action Type</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Risk Level</label>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Risk Levels</option>
              <option value="High">High Risk Only</option>
              <option value="Medium">Medium Risk Only</option>
              <option value="Low">Low Risk Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grouped Actions */}
      <div className="space-y-6">
        {groupedActions.map((group, groupIdx) => (
          <div key={groupIdx} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold mb-1">{group.group}</h2>
                  <p className="text-slate-300 text-sm">
                    {group.totalCases} cases • {group.highRisk} high-risk • 
                    Avg risk reduction: {group.avgRiskReduction.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.items.slice(0, 12).map((item, idx) => {
                  const confidence = getConfidenceLevel(item);
                  const riskReduction = item.Predicted_SLA_Risk - item.Expected_Risk_After_Action;
                  
                  return (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold text-slate-800 text-sm mb-1">{item.Case_ID}</div>
                          <div className="text-xs text-slate-600">{item.Case_Type}</div>
                        </div>
                        <span
                          className="px-2 py-1 text-xs font-semibold rounded-full text-white"
                          style={{ backgroundColor: COLORS[item.Risk_Level] }}
                        >
                          {item.Risk_Level}
                        </span>
                      </div>

                      <div className="mb-3">
                        <div className="text-xs text-slate-600 mb-1">Current Risk</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                item.Predicted_SLA_Risk >= 70 ? 'bg-red-600' :
                                item.Predicted_SLA_Risk >= 40 ? 'bg-yellow-600' : 'bg-green-600'
                              }`}
                              style={{ width: `${Math.min(item.Predicted_SLA_Risk, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-slate-700">
                            {item.Predicted_SLA_Risk.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="text-xs font-semibold text-slate-700 mb-1">Recommended Action</div>
                        <div className="text-sm text-slate-800 bg-blue-50 p-2 rounded">
                          {item.Recommended_Action || 'No action needed'}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-slate-600">Expected Risk</div>
                          <div className="font-semibold text-green-600">
                            {item.Expected_Risk_After_Action.toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-600">Reduction</div>
                          <div className="font-semibold text-green-600">
                            {riskReduction.toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-600">Confidence</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            confidence.color === 'green' ? 'bg-green-100 text-green-800' :
                            confidence.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {confidence.level}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {group.items.length > 12 && (
                <div className="mt-4 text-center text-sm text-slate-600">
                  + {group.items.length - 12} more cases
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Action Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="text-sm text-slate-600 mb-1">Total Actions</div>
            <div className="text-2xl font-bold text-slate-800">
              {data.filter(d => d.Recommended_Action && d.Recommended_Action !== 'No action needed').length}
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="text-sm text-slate-600 mb-1">High Priority</div>
            <div className="text-2xl font-bold text-red-600">
              {data.filter(d => d.Risk_Level === 'High' && d.Recommended_Action && d.Recommended_Action !== 'No action needed').length}
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="text-sm text-slate-600 mb-1">Avg Risk Reduction</div>
            <div className="text-2xl font-bold text-green-600">
              {(
                data
                  .filter(d => d.Recommended_Action && d.Recommended_Action !== 'No action needed')
                  .reduce((sum, d) => sum + (d.Predicted_SLA_Risk - d.Expected_Risk_After_Action), 0) /
                data.filter(d => d.Recommended_Action && d.Recommended_Action !== 'No action needed').length
              ).toFixed(1)}%
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="text-sm text-slate-600 mb-1">No Action Needed</div>
            <div className="text-2xl font-bold text-slate-600">
              {data.filter(d => !d.Recommended_Action || d.Recommended_Action === 'No action needed').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

