import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { path: '/', label: 'Executive Dashboard', icon: '📊' },
  { path: '/cases', label: 'Case Intelligence', icon: '🔍' },
  { path: '/bottlenecks', label: 'Bottleneck Analysis', icon: '🔧' },
  { path: '/simulation', label: 'What-If Simulation', icon: '🧪' },
  { path: '/recommendations', label: 'Action Planner', icon: '✅' },
  { path: '/reports', label: 'Reports & Insights', icon: '📈' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white shadow-xl">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-white">Operations Intelligence</h1>
        <p className="text-sm text-slate-400 mt-1">Decision Platform</p>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-700 text-white border-l-4 border-blue-400'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-0 w-64 p-6 border-t border-slate-700">
        <p className="text-xs text-slate-400">Powered by AI Decision Intelligence</p>
      </div>
    </div>
  );
}

