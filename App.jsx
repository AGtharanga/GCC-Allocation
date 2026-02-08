import React, { useState, useEffect, useCallback } from 'react';
import { MARKET_CATEGORIES, INITIAL_AGENTS, DEFAULT_COLORS } from './constants';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import Admin from './components/Admin';
import AllocationModal from './components/AllocationModal';
import ResetModal from './components/ResetModal';
import { ShieldCheck, LayoutDashboard, BarChart3, Settings2, Zap, LogOut } from 'lucide-react';

// FIREBASE IMPORTS
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc, collection, query, orderBy, addDoc, updateDoc } from "firebase/firestore";

// Your Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDLwvctWxc19zrHFAyFybnZq_yoKleuZI",
  authDomain: "gcc-allocator.firebaseapp.com",
  projectId: "gcc-allocator",
  storageBucket: "gcc-allocator.firebasestorage.app",
  messagingSenderId: "1055272661073",
  appId: "1:1055272661073:web:53177f15303df0b39f37c7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [agents, setAgents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [teamConfigs, setTeamConfigs] = useState({});
  
  const [activeMarket, setActiveMarket] = useState(MARKET_CATEGORIES[0]);
  const [activeDayIdx, setActiveDayIdx] = useState(new Date().getDay());
  const [allocationTarget, setAllocationTarget] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);

  // 1. SYNC AGENTS & CONFIGS IN REAL-TIME
  useEffect(() => {
    // Sync Agents
    const unsubAgents = onSnapshot(doc(db, "system", "agents"), (docSnap) => {
      if (docSnap.exists()) {
        setAgents(docSnap.data().data);
      } else {
        setAgents(INITIAL_AGENTS);
        setDoc(doc(db, "system", "agents"), { data: INITIAL_AGENTS });
      }
    });

    // Sync Team Configs
    const unsubTeams = onSnapshot(doc(db, "system", "teams"), (docSnap) => {
      if (docSnap.exists()) setTeamConfigs(docSnap.data().data);
    });

    // Sync Logs (Latest 100)
    const q = query(collection(db, "logs"), orderBy("time", "desc"));
    const unsubLogs = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(logsData);
    });

    // Check Local Identity (Keep login simple)
    const savedUser = localStorage.getItem('gcc_user');
    if (savedUser) {
      setUserName(savedUser);
      setIsLoggedIn(true);
    }

    return () => { unsubAgents(); unsubTeams(); unsubLogs(); };
  }, []);

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
    localStorage.setItem('gcc_user', name);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName('');
    localStorage.removeItem('gcc_user');
  };

  const handleAllocation = (agentId, market) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent || agent.isFrozen) return;
    setAllocationTarget({ agent, market });
  };

  // 2. SAVE ALLOCATION TO CLOUD (Syncs everyone)
  const confirmAllocation = async () => {
    if (!allocationTarget) return;
    const { agent, market } = allocationTarget;
    
    const updatedAgents = agents.map(a => {
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
    });

    // Update Global State
    await setDoc(doc(db, "system", "agents"), { data: updatedAgents });

    // Add Log Entry
    await addDoc(collection(db, "logs"), {
      agentName: agent.name,
      team: agent.team || 'Unassigned',
      market,
      time: new Date().toISOString(),
      allocatedBy: userName
    });

    setAllocationTarget(null);
  };

  const resetAllAllocations = async () => {
    const resetAgents = agents.map(a => ({ ...a, marketCurrents: {} }));
    await setDoc(doc(db, "system", "agents"), { data: resetAgents });
    setShowResetModal(false);
  };

  // UI RENDER (Login Screen)
  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] max-w-sm w-full p-10 shadow-2xl text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <Zap className="h-8 w-8 text-white fill-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">OLANKA GCC</h2>
          <input 
            type="text" 
            placeholder="Identity Name" 
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-center text-lg font-bold outline-none mb-6"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <button 
            onClick={() => handleLogin(userName)}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black"
          >
            Enter Workspace
          </button>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Zap className="text-indigo-600 h-6 w-6" />
          <h1 className="font-black text-lg">OLANKA <span className="text-indigo-600">GCC</span></h1>
          <div className="ml-6 px-4 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase text-slate-500">
            User: {userName}
          </div>
        </div>
        
        <nav className="flex bg-slate-100 p-1 rounded-2xl">
          {[{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'logs', label: 'Reports', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: Settings2 }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-black text-xs transition-all ${activeTab === tab.id ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500'}`}>
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </nav>

        <button onClick={handleLogout} className="text-slate-400 hover:text-rose-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
          <LogOut size={16} /> Sign Out
        </button>
      </header>

      <div className="max-w-[1600px] mx-auto p-6">
        {activeTab === 'dashboard' && (
          <Dashboard agents={agents} activeMarket={activeMarket} activeDayIdx={activeDayIdx} 
            setActiveMarket={setActiveMarket} setActiveDayIdx={setActiveDayIdx}
            onAllocate={handleAllocation} getTeamColor={getTeamColor} teamConfigs={teamConfigs} />
        )}
        {activeTab === 'logs' && <Reports logs={logs} agents={agents} getTeamColor={getTeamColor} />}
        {activeTab === 'settings' && (
          <Admin agents={agents} setAgents={(newAgents) => setDoc(doc(db, "system", "agents"), { data: newAgents })}
            teamConfigs={teamConfigs} setTeamConfigs={(newTeams) => setDoc(doc(db, "system", "teams"), { data: newTeams })}
            getTeamColor={getTeamColor} onReset={() => setShowResetModal(true)} />
        )}
      </div>

      {allocationTarget && <AllocationModal agent={allocationTarget.agent} market={allocationTarget.market} onClose={() => setAllocationTarget(null)} onConfirm={confirmAllocation} />}
      {showResetModal && <ResetModal onClose={() => setShowResetModal(false)} onConfirm={resetAllAllocations} />}
    </div>
  );
};

export default App;
