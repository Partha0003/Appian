import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function WhatIfSimulation({ data }) {
  const [simulationParams, setSimulationParams] = useState({
    activeAgents: 8,
    queueDepth: 100,
    automationLevel: 50, // percentage
  });

  const [selectedCase, setSelectedCase] = useState(null);

  // Calculate simulated risk based on parameters
  const calculateSimulatedRisk = (caseItem) => {
    const currentLoadIndex = caseItem.Load_Index;
    const currentRisk = caseItem.Predicted_SLA_Risk;

    // Simulate new load index based on agents and queue depth
    const simulatedLoadIndex = (simulationParams.queueDepth / simulationParams.activeAgents) * 
      (caseItem.Avg_Handle_Time_Mins / 60);

    // Factor in automation level
    const automationFactor = 1 - (simulationParams.automationLevel / 100) * 0.3; // Up to 30% reduction
    const adjustedLoadIndex = simulatedLoadIndex * automationFactor;

    // Calculate risk based on load index (simplified model)
    let simulatedRisk = 0;
    if (adjustedLoadIndex > 50) {
      simulatedRisk = Math.min(95, 50 + (adjustedLoadIndex - 50) * 0.9);
    } else if (adjustedLoadIndex > 20) {
      simulatedRisk = 30 + (adjustedLoadIndex - 20) * 0.67;
    } else {
      simulatedRisk = adjustedLoadIndex * 1.5;
    }

    // Factor in complexity
    simulatedRisk += caseItem.Complexity_Score * 10;
    simulatedRisk = Math.min(95, Math.max(5, simulatedRisk));

    return {
      simulatedRisk: Math.round(simulatedRisk),
      simulatedLoadIndex: adjustedLoadIndex,
      riskReduction: currentRisk - simulatedRisk,
      timeToBreach: adjustedLoadIndex > 40 ? Math.round((caseItem.SLA_Limit_Mins * 0.3)) : null,
    };
  };

  const comparisonData = useMemo(() => {
    if (!selectedCase) return null;
    const simulated = calculateSimulatedRisk(selectedCase);
    return {
      current: {
        risk: selectedCase.Predicted_SLA_Risk,
        loadIndex: selectedCase.Load_Index,
        timeToBreach: selectedCase.Estimated_Time_To_Breach_Mins,
      },
      simulated: {
        risk: simulated.simulatedRisk,
        loadIndex: simulated.simulatedLoadIndex,
        timeToBreach: simulated.timeToBreach,
      },
      riskReduction: simulated.riskReduction,
    };
  }, [selectedCase, simulationParams]);

  const getBestAction = () => {
    if (!selectedCase) return null;

    const actions = [
      {
        name: 'Add Agents',
        impact: Math.max(0, selectedCase.Predicted_SLA_Risk - calculateSimulatedRisk({
          ...selectedCase,
          Active_Agents: selectedCase.Active_Agents + 2,
        }).simulatedRisk),
        confidence: 'High',
      },
      {
        name: 'Increase Automation',
        impact: Math.max(0, selectedCase.Predicted_SLA_Risk - calculateSimulatedRisk({
          ...selectedCase,
          Automation_Level: 'Auto',
        }).simulatedRisk),
        confidence: 'Medium',
      },
      {
        name: 'Reduce Queue Depth',
        impact: Math.max(0, selectedCase.Predicted_SLA_Risk - calculateSimulatedRisk({
          ...selectedCase,
          Queue_Depth: Math.max(10, selectedCase.Queue_Depth - 50),
        }).simulatedRisk),
        confidence: 'Medium',
      },
    ];

    return actions.sort((a, b) => b.impact - a.impact)[0];
  };

  const bestAction = getBestAction();

  // Sample cases for selection
  const sampleCases = useMemo(() => {
    return data
      .filter(d => d.Risk_Level === 'High')
      .slice(0, 10)
      .map(item => ({
        ...item,
        simulated: calculateSimulatedRisk(item),
      }));
  }, [data, simulationParams]);

  const chartData = comparisonData ? [
    {
      name: 'SLA Risk %',
      Current: comparisonData.current.risk,
      Simulated: comparisonData.simulated.risk,
    },
    {
      name: 'Load Index',
      Current: Math.round(comparisonData.current.loadIndex),
      Simulated: Math.round(comparisonData.simulated.loadIndex),
    },
  ] : [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">What-If Simulation & Decision Lab</h1>
        <p className="text-slate-600">Test different scenarios safely before making operational decisions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Simulation Parameters */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-slate-700 mb-4">Simulation Parameters</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Active Agents: {simulationParams.activeAgents}
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={simulationParams.activeAgents}
                  onChange={(e) => setSimulationParams({
                    ...simulationParams,
                    activeAgents: parseInt(e.target.value),
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>1</span>
                  <span>20</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Queue Depth: {simulationParams.queueDepth}
                </label>
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={simulationParams.queueDepth}
                  onChange={(e) => setSimulationParams({
                    ...simulationParams,
                    queueDepth: parseInt(e.target.value),
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>10</span>
                  <span>200</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Automation Level: {simulationParams.automationLevel}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={simulationParams.automationLevel}
                  onChange={(e) => setSimulationParams({
                    ...simulationParams,
                    automationLevel: parseInt(e.target.value),
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Case Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-slate-700 mb-4">Select Case to Simulate</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sampleCases.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedCase(item)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedCase?.Case_ID === item.Case_ID
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-medium text-slate-800">{item.Case_ID}</div>
                  <div className="text-sm text-slate-600">{item.Queue_Name} • {item.Case_Type}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Current Risk: {item.Predicted_SLA_Risk.toFixed(1)}% → 
                    Simulated: {item.simulated.simulatedRisk}%
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCase ? (
            <>
              {/* Comparison Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-slate-700 mb-4">Current vs Simulated Scenario</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Current" fill="#9fb3c8" />
                    <Bar dataKey="Simulated" fill="#334e68" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Detailed Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-md font-semibold text-slate-700 mb-4">Current State</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-slate-600 mb-1">SLA Risk</div>
                      <div className="text-2xl font-bold text-red-600">
                        {comparisonData.current.risk.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Load Index</div>
                      <div className="text-2xl font-bold text-slate-800">
                        {comparisonData.current.loadIndex.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Time to Breach</div>
                      <div className="text-2xl font-bold text-slate-800">
                        {comparisonData.current.timeToBreach 
                          ? `${comparisonData.current.timeToBreach} min`
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border-2 border-blue-500">
                  <h3 className="text-md font-semibold text-slate-700 mb-4">Simulated State</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-slate-600 mb-1">SLA Risk</div>
                      <div className={`text-2xl font-bold ${
                        comparisonData.simulated.risk < comparisonData.current.risk
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {comparisonData.simulated.risk.toFixed(1)}%
                      </div>
                      {comparisonData.riskReduction > 0 && (
                        <div className="text-sm text-green-600 mt-1">
                          ↓ {comparisonData.riskReduction.toFixed(1)}% reduction
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Load Index</div>
                      <div className="text-2xl font-bold text-slate-800">
                        {comparisonData.simulated.loadIndex.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Time to Breach</div>
                      <div className="text-2xl font-bold text-slate-800">
                        {comparisonData.simulated.timeToBreach 
                          ? `${comparisonData.simulated.timeToBreach} min`
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendation Engine */}
              {bestAction && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border border-blue-200">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4">AI Recommendation</h2>
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-800">Best Action: {bestAction.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        bestAction.confidence === 'High' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {bestAction.confidence} Confidence
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 mb-3">
                      Implementing this action is expected to reduce SLA risk by approximately{' '}
                      <span className="font-semibold text-green-600">{bestAction.impact.toFixed(1)}%</span>.
                    </p>
                    <p className="text-sm text-slate-600">
                      This recommendation is based on the current operational state and the simulated parameters. 
                      The impact calculation considers load index, queue depth, and automation level changes.
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">🧪</div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Select a Case to Simulate</h3>
              <p className="text-slate-600">
                Choose a case from the list on the left and adjust the simulation parameters to see how different 
                operational changes would affect SLA risk and time to breach.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

