import { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export default function BottleneckAnalysis({ data }) {
  const queueDepthVsAgents = useMemo(() => {
    return data.map(item => ({
      queueDepth: item.Queue_Depth,
      activeAgents: item.Active_Agents,
      risk: item.Predicted_SLA_Risk,
      caseId: item.Case_ID,
    }));
  }, [data]);

  const loadIndexVsRisk = useMemo(() => {
    return data.map(item => ({
      loadIndex: item.Load_Index,
      risk: item.Predicted_SLA_Risk,
      caseId: item.Case_ID,
    }));
  }, [data]);

  const complexityVsDelay = useMemo(() => {
    const grouped = data.reduce((acc, item) => {
      const complexityRange = Math.floor(item.Complexity_Score * 10) / 10;
      if (!acc[complexityRange]) {
        acc[complexityRange] = { count: 0, highRisk: 0 };
      }
      acc[complexityRange].count++;
      if (item.Risk_Level === 'High') {
        acc[complexityRange].highRisk++;
      }
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([complexity, stats]) => ({
        complexity: parseFloat(complexity),
        totalCases: stats.count,
        highRiskCases: stats.highRisk,
        riskRate: (stats.highRisk / stats.count) * 100,
      }))
      .sort((a, b) => a.complexity - b.complexity);
  }, [data]);

  const rootCauseSummary = useMemo(() => {
    const bottlenecks = data.reduce((acc, item) => {
      const bottleneck = item.Operational_Bottleneck || 'None';
      if (!acc[bottleneck]) {
        acc[bottleneck] = { count: 0, highRisk: 0, avgLoad: 0, totalLoad: 0 };
      }
      acc[bottleneck].count++;
      if (item.Risk_Level === 'High') {
        acc[bottleneck].highRisk++;
      }
      acc[bottleneck].totalLoad += item.Load_Index;
      return acc;
    }, {});

    return Object.entries(bottlenecks).map(([bottleneck, stats]) => ({
      bottleneck,
      count: stats.count,
      highRiskCount: stats.highRisk,
      highRiskPercentage: (stats.highRisk / stats.count) * 100,
      avgLoad: stats.totalLoad / stats.count,
    })).sort((a, b) => b.highRiskCount - a.highRiskCount);
  }, [data]);

  const getInsights = () => {
    const staffingBottlenecks = rootCauseSummary.find(r => r.bottleneck.includes('Staffing'));
    const workloadBottlenecks = rootCauseSummary.find(r => r.bottleneck.includes('Workload'));
    const totalHighRisk = data.filter(d => d.Risk_Level === 'High').length;
    const avgLoadIndex = data.reduce((sum, d) => sum + d.Load_Index, 0) / data.length;

    return {
      staffing: staffingBottlenecks ? {
        count: staffingBottlenecks.count,
        highRisk: staffingBottlenecks.highRiskCount,
        percentage: (staffingBottlenecks.highRiskCount / totalHighRisk) * 100,
        avgLoad: staffingBottlenecks.avgLoad,
      } : null,
      workload: workloadBottlenecks ? {
        count: workloadBottlenecks.count,
        highRisk: workloadBottlenecks.highRiskCount,
        percentage: (workloadBottlenecks.highRiskCount / totalHighRisk) * 100,
        avgLoad: workloadBottlenecks.avgLoad,
      } : null,
      overallAvgLoad: avgLoadIndex,
      totalHighRisk,
    };
  };

  const insights = getInsights();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Bottleneck & Root Cause Analysis</h1>
        <p className="text-slate-600">Understand why delays happen and identify operational constraints</p>
      </div>

      {/* Root Cause Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="text-sm text-slate-600 mb-1">Staffing Bottlenecks</div>
          <div className="text-3xl font-bold text-red-600">{insights.staffing?.highRisk || 0}</div>
          <div className="text-xs text-slate-500 mt-1">
            {insights.staffing ? `${insights.staffing.percentage.toFixed(1)}% of high-risk cases` : 'N/A'}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="text-sm text-slate-600 mb-1">Workload Spikes</div>
          <div className="text-3xl font-bold text-yellow-600">{insights.workload?.highRisk || 0}</div>
          <div className="text-xs text-slate-500 mt-1">
            {insights.workload ? `${insights.workload.percentage.toFixed(1)}% of high-risk cases` : 'N/A'}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="text-sm text-slate-600 mb-1">Skill Dependency</div>
          <div className="text-3xl font-bold text-blue-600">
            {data.filter(d => d.Agent_Skill_Level === 'Expert' && d.Risk_Level === 'High').length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Expert-dependent high-risk</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="text-sm text-slate-600 mb-1">Automation Gaps</div>
          <div className="text-3xl font-bold text-purple-600">
            {data.filter(d => d.Automation_Level === 'Manual' && d.Risk_Level === 'High').length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Manual process high-risk</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Queue Depth vs Active Agents</h2>
          <p className="text-sm text-slate-600 mb-4">
            Higher queue depth with fewer agents indicates staffing constraints. Color intensity shows SLA risk level.
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="queueDepth" name="Queue Depth" />
              <YAxis type="number" dataKey="activeAgents" name="Active Agents" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter
                data={queueDepthVsAgents}
                fill="#334e68"
                fillOpacity={0.6}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Load Index vs SLA Risk</h2>
          <p className="text-sm text-slate-600 mb-4">
            Higher load index correlates with increased SLA breach risk. Points above the trend line need attention.
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="loadIndex" name="Load Index" />
              <YAxis type="number" dataKey="risk" name="SLA Risk %" domain={[0, 100]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter
                data={loadIndexVsRisk}
                fill="#dc2626"
                fillOpacity={0.5}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Complexity vs Delay Risk */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Complexity vs Delay Risk</h2>
        <p className="text-sm text-slate-600 mb-4">
          Cases with higher complexity scores show increased risk of delays. This helps identify where additional resources or automation may be needed.
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={complexityVsDelay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="complexity" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="totalCases" fill="#9fb3c8" name="Total Cases" />
            <Bar yAxisId="right" dataKey="highRiskCases" fill="#dc2626" name="High Risk Cases" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Root Cause Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Root Cause Breakdown</h2>
        <div className="space-y-4">
          {rootCauseSummary.map((item, idx) => (
            <div key={idx} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-800">{item.bottleneck}</h3>
                <span className="text-sm text-slate-600">{item.count} cases</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">High Risk Cases:</span>
                    <span className="font-medium text-red-600">{item.highRiskCount} ({item.highRiskPercentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{ width: `${item.highRiskPercentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm text-slate-600">
                  Avg Load: <span className="font-medium">{item.avgLoad.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights Panel */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border border-blue-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Key Insights</h2>
        <div className="space-y-3 text-slate-700">
          {insights.staffing && (
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-slate-800 mb-2">Staffing Constraints</h3>
              <p className="text-sm">
                {insights.staffing.highRisk} high-risk cases ({insights.staffing.percentage.toFixed(1)}% of all high-risk) 
                are caused by insufficient staffing. The average load index for these cases is {insights.staffing.avgLoad.toFixed(2)}, 
                indicating that adding or reallocating agents would significantly reduce risk.
              </p>
            </div>
          )}
          {insights.workload && (
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-slate-800 mb-2">Workload Spikes</h3>
              <p className="text-sm">
                {insights.workload.highRisk} high-risk cases ({insights.workload.percentage.toFixed(1)}% of all high-risk) 
                are experiencing workload spikes. These cases have an average load index of {insights.workload.avgLoad.toFixed(2)}. 
                Consider implementing dynamic workload balancing or temporary resource allocation during peak periods.
              </p>
            </div>
          )}
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-semibold text-slate-800 mb-2">Overall System Health</h3>
            <p className="text-sm">
              The average load index across all cases is {insights.overallAvgLoad.toFixed(2)}. 
              With {insights.totalHighRisk} total high-risk cases, the system is experiencing significant pressure. 
              Focus on addressing staffing bottlenecks first, as they represent the largest portion of high-risk scenarios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

