import React, { useState, useEffect, useCallback } from 'react';

import { MARKET_CATEGORIES, INITIAL_AGENTS, DEFAULT_COLORS } from './constants';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import Admin from './components/Admin';
import AllocationModal from './components/AllocationModal';
import ResetModal from './components/ResetModal';
import { ShieldCheck, LayoutDashboard, BarChart3, Settings2, Zap, LogOut } from 'lucide-react';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [agents, setAgents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [teamConfigs, setTeamConfigs] = useState({});
  
  // Selection States
  const [activeMarket, setActiveMarket] = useState(MARKET_CATEGORIES[0]);
  const [activeDayIdx, setActiveDayIdx] = useState(new Date().getDay());

  // Modal States
  const [allocationTarget, setAllocationTarget] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);

  // Persistence
  useEffect(() => {
    const savedAgents = localStorage.getItem('gcc_agents');
    const savedLogs = localStorage.getItem('gcc_logs');
    const savedTeamConfigs = localStorage.getItem('gcc_team_configs');
    const savedUser = localStorage.getItem('gcc_user');

    if (savedAgents) setAgents(JSON.parse(savedAgents));
    else setAgents(INITIAL_AGENTS);

    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedTeamConfigs) setTeamConfigs(JSON.parse(savedTeamConfigs));
    if (savedUser) {
      setUserName(savedUser);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (agents.length > 0) localStorage.setItem('gcc_agents', JSON.stringify(agents));
    localStorage.setItem('gcc_logs', JSON.stringify(logs));
    localStorage.setItem('gcc_team_configs', JSON.stringify(teamConfigs));
    if (isLoggedIn) localStorage.setItem('gcc_user', userName);
    else localStorage.removeItem('gcc_user');
  }, [agents, logs, teamConfigs, isLoggedIn, userName]);

  const getTeamColor = useCallback((teamName) => {
    const name = teamName?.toUpperCase() || "UNASSIGNED";
    if (teamConfigs[name]?.color) return teamConfigs[name].color;
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return DEFAULT_COLORS[Math.abs(hash) % DEFAULT_COLORS.length];
  }, [teamConfigs]);

  const handleLogin = (name) => {
    if (!name.trim()) return;
    setUserName(name);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName('');
  };

  const handleAllocation = (agentId, market) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent || agent.isFrozen) return;
    const current = (agent.marketCurrents || {})[market] || 0;
    const quota = agent.marketConfigs.find(c => c.category === market)?.quota || 0;
    if (current >= quota) return;

    setAllocationTarget({ agent, market });
  };

  const confirmAllocation = () => {
    if (!allocationTarget) return;
    const { agent, market } = allocationTarget;
    
    setAgents(prev => prev.map(a => {
      if (a.id === agent.id) {
        return {
          ...a,
          marketCurrents: {
            ...a.marketCurrents,
            [market]: (a.marketCurrents[market] || 0) + 1
          },
          updatedAt: Date.now()
        };
      }
      return a;
    }));

    const newLog = {
      id: Date.now().toString(),
      agentName: agent.name,
      team: agent.team || 'Unassigned',
      market,
      time: new Date().toISOString(),
      allocatedBy: userName
    };
    setLogs(prev => [newLog, ...prev]);
    setAllocationTarget(null);
  };

  const resetAllAllocations = () => {
    setAgents(prev => prev.map(a => ({ ...a, marketCurrents: {} })));
    setShowResetModal(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.15),transparent)] pointer-events-none" />
        <div className="bg-white rounded-[2.5rem] max-w-sm w-full p-10 shadow-2xl text-center relative z-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Zap className="h-8 w-8 text-white fill-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">OLANKA GCC</h2>
          <p className="text-slate-400 text-sm mb-8 font-medium uppercase tracking-wider">Access Management Portal</p>
          <input 
            type="text" 
            placeholder="Identity Name" 
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-center text-lg font-bold outline-none focus:border-indigo-500 focus:bg-white mb-6 transition-all"
            value={userName}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin(userName)}
            onChange={(e) => setUserName(e.target.value)}
          />
          <button 
            onClick={() => handleLogin(userName)}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all transform active:scale-[0.98] hover:-translate-y-0.5"
          >
            Enter Workspace
          </button>
        </div>
      </div>
    );
  }

  return (<div className="min-h-screen bg-[#F8FAFC]">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <Zap className="text-white h-5 w-5 fill-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-black text-lg tracking-tighter uppercase leading-none">OLANKA <span className="text-indigo-600">GCC</span></h1>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Resource Allocation System</span>
          </div>
          <div className="hidden lg:flex items-center gap-2 ml-6 px-4 py-2 bg-slate-100/80 rounded-full border border-slate-200/50">
            <ShieldCheck size={14} className="text-indigo-600" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{userName}</span>
          </div>
        </div>
        
        <nav className="flex bg-slate-100/80 p-1 rounded-2xl border border-slate-200/50">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'logs', label: 'Reports', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: Settings2 }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs transition-all uppercase tracking-wider ${
                activeTab === tab.id 
                  ? 'bg-white shadow-md text-indigo-600 border border-slate-200/50' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <tab.icon size={14} strokeWidth={2.5} />
              {tab.label}
            </button>
          ))}
        </nav>

        <button 
          onClick={handleLogout}
          className="hidden md:flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-rose-500 transition-colors font-bold text-xs uppercase tracking-widest"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </header>

      <div className="max-w-[1600px] mx-auto">
        {activeTab === 'dashboard' && (
          <Dashboard 
            agents={agents} 
            activeMarket={activeMarket} 
            activeDayIdx={activeDayIdx} 
            setActiveMarket={setActiveMarket}
            setActiveDayIdx={setActiveDayIdx}
            onAllocate={handleAllocation}
            getTeamColor={getTeamColor}
            teamConfigs={teamConfigs}
          />
        )}

        {activeTab === 'logs' && (
          <Reports 
            logs={logs} 
            agents={agents} 
            getTeamColor={getTeamColor} 
          />
        )}

        {activeTab === 'settings' && (<Admin 
            agents={agents} 
            setAgents={setAgents}
            teamConfigs={teamConfigs}
            setTeamConfigs={setTeamConfigs}
            getTeamColor={getTeamColor}
            onReset={() => setShowResetModal(true)}
          />
        )}
      </div>

      {allocationTarget && (<AllocationModal 
          agent={allocationTarget.agent} 
          market={allocationTarget.market} 
          onClose={() => setAllocationTarget(null)} 
          onConfirm={confirmAllocation} 
        />
      )}

      {showResetModal && (<ResetModal 
          onClose={() => setShowResetModal(false)} 
          onConfirm={resetAllAllocations} 
        />
      )}
    </div>
  );
};

export default App;
