import { useState, useMemo } from 'react';

const COLORS = {
  High: '#dc2626',
  Medium: '#f59e0b',
  Low: '#10b981',
};

export default function CaseIntelligenceExplorer({ data }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCase, setSelectedCase] = useState(null);
  const itemsPerPage = 20;

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.Case_ID?.toLowerCase().includes(searchLower) ||
        item.Case_Type?.toLowerCase().includes(searchLower) ||
        item.Queue_Name?.toLowerCase().includes(searchLower) ||
        item.Operational_Bottleneck?.toLowerCase().includes(searchLower) ||
        item.Recommended_Action?.toLowerCase().includes(searchLower)
      );
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedData, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getRiskColor = (riskLevel) => {
    return COLORS[riskLevel] || '#6b7280';
  };

  const formatTimeToBreach = (mins) => {
    if (mins === null || mins === undefined) return 'N/A';
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Case Intelligence Explorer</h1>
        <p className="text-slate-600">Detailed case-by-case analysis with AI-generated insights</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <input
          type="text"
          placeholder="Search by Case ID, Type, Queue, Bottleneck, or Action..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-4 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-200"
                  onClick={() => handleSort('Case_ID')}
                >
                  Case ID {sortConfig.key === 'Case_ID' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-200"
                  onClick={() => handleSort('Case_Type')}
                >
                  Case Type {sortConfig.key === 'Case_Type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-200"
                  onClick={() => handleSort('Queue_Name')}
                >
                  Queue {sortConfig.key === 'Queue_Name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-200"
                  onClick={() => handleSort('SLA_Limit_Mins')}
                >
                  SLA Limit {sortConfig.key === 'SLA_Limit_Mins' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-200"
                  onClick={() => handleSort('Predicted_SLA_Risk')}
                >
                  Risk % {sortConfig.key === 'Predicted_SLA_Risk' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-200"
                  onClick={() => handleSort('Risk_Level')}
                >
                  Risk Level {sortConfig.key === 'Risk_Level' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-200"
                  onClick={() => handleSort('Estimated_Time_To_Breach_Mins')}
                >
                  Time to Breach {sortConfig.key === 'Estimated_Time_To_Breach_Mins' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Bottleneck
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {paginatedData.map((item, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedCase(item)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {item.Case_ID}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {item.Case_Type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {item.Queue_Name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {item.SLA_Limit_Mins} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    <span className={`font-semibold ${item.Predicted_SLA_Risk >= 70 ? 'text-red-600' : item.Predicted_SLA_Risk >= 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {item.Predicted_SLA_Risk.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="px-2 py-1 text-xs font-semibold rounded-full text-white"
                      style={{ backgroundColor: getRiskColor(item.Risk_Level) }}
                    >
                      {item.Risk_Level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {formatTimeToBreach(item.Estimated_Time_To_Breach_Mins)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {item.Operational_Bottleneck || 'None'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {item.Recommended_Action || 'No action needed'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-slate-700">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} of {filteredAndSortedData.length} cases
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Side Panel */}
      {selectedCase && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 overflow-y-auto">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Case Details</h2>
            <button
              onClick={() => setSelectedCase(null)}
              className="text-slate-500 hover:text-slate-700 text-2xl"
            >
              ×
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-600 uppercase mb-2">Case Information</h3>
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Case ID:</span>
                  <span className="font-medium text-slate-900">{selectedCase.Case_ID}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Case Type:</span>
                  <span className="font-medium text-slate-900">{selectedCase.Case_Type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Queue:</span>
                  <span className="font-medium text-slate-900">{selectedCase.Queue_Name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">SLA Limit:</span>
                  <span className="font-medium text-slate-900">{selectedCase.SLA_Limit_Mins} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Timestamp:</span>
                  <span className="font-medium text-slate-900">{selectedCase.Timestamp}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-600 uppercase mb-2">Operational State</h3>
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Queue Depth:</span>
                  <span className="font-medium text-slate-900">{selectedCase.Queue_Depth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Active Agents:</span>
                  <span className="font-medium text-slate-900">{selectedCase.Active_Agents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Load Index:</span>
                  <span className="font-medium text-slate-900">{selectedCase.Load_Index.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Complexity Score:</span>
                  <span className="font-medium text-slate-900">{selectedCase.Complexity_Score.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Avg Handle Time:</span>
                  <span className="font-medium text-slate-900">{selectedCase.Avg_Handle_Time_Mins} min</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-600 uppercase mb-2">Risk Assessment</h3>
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-600">Predicted SLA Risk:</span>
                    <span className={`font-bold text-lg ${selectedCase.Predicted_SLA_Risk >= 70 ? 'text-red-600' : selectedCase.Predicted_SLA_Risk >= 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {selectedCase.Predicted_SLA_Risk.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${selectedCase.Predicted_SLA_Risk >= 70 ? 'bg-red-600' : selectedCase.Predicted_SLA_Risk >= 40 ? 'bg-yellow-600' : 'bg-green-600'}`}
                      style={{ width: `${Math.min(selectedCase.Predicted_SLA_Risk, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Risk Level:</span>
                  <span
                    className="px-3 py-1 text-sm font-semibold rounded-full text-white"
                    style={{ backgroundColor: getRiskColor(selectedCase.Risk_Level) }}
                  >
                    {selectedCase.Risk_Level}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Time to Breach:</span>
                  <span className="font-medium text-slate-900">
                    {formatTimeToBreach(selectedCase.Estimated_Time_To_Breach_Mins)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-600 uppercase mb-2">AI Intelligence</h3>
              <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                <div>
                  <span className="text-sm font-medium text-slate-700">Operational Bottleneck:</span>
                  <p className="text-slate-900 mt-1">{selectedCase.Operational_Bottleneck || 'None identified'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-700">Recommended Action:</span>
                  <p className="text-slate-900 mt-1 font-semibold">{selectedCase.Recommended_Action || 'No action needed'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-700">Expected Risk After Action:</span>
                  <p className="text-slate-900 mt-1">
                    <span className="font-semibold">{selectedCase.Expected_Risk_After_Action.toFixed(1)}%</span>
                    <span className="text-sm text-slate-600 ml-2">
                      (reduction of {(selectedCase.Predicted_SLA_Risk - selectedCase.Expected_Risk_After_Action).toFixed(1)}%)
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

