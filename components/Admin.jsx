import React, { useState, useMemo } from 'react';

import { MARKET_CATEGORIES, DAYS_SHORT } from '../constants';
import { Search, Plus, Trash2, ChevronDown, RefreshCw, Star, Lock, Palette } from 'lucide-react';

const Admin = ({ agents, setAgents, teamConfigs, setTeamConfigs, getTeamColor, onReset }) => {
  const [search, setSearch] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);

  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    (a.team || '').toLowerCase().includes(search.toLowerCase())
  );

  const allTeams = useMemo(() => [...new Set(agents.map(a => a.team?.toUpperCase()).filter(Boolean))].sort(), [agents]);

  const updateTeamConfig = (team, updates) => {
    setTeamConfigs(prev => ({
      ...prev,
      [team]: { ... (prev[team] || { color: getTeamColor(team), days: [1,2,3,4,5] }), ...updates }
    }));
  };

  const toggleDay = (team, day) => {
    const teamUpper = team.toUpperCase();
    const currentDays = teamConfigs[teamUpper]?.days || [1,2,3,4,5];
    const newDays = currentDays.includes(day) ? currentDays.filter(d => d !== day) : [...currentDays, day];
    updateTeamConfig(teamUpper, { days: newDays });
  };

  const updateAgent = (id, updates) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const addNewAgent = () => {
    const newAgent = {
      id: Date.now().toString(),
      name: 'New Identity',
      team: 'ALPHA',
      marketConfigs: [{ category: MARKET_CATEGORIES[0], quota: 10 }],
      marketCurrents: {},
      isPriority: false,
      isFrozen: false
    };
    setAgents(prev => [newAgent, ...prev]);
  };

  return (
    <main className="p-6 md:p-8 space-y-10 max-w-[1200px] mx-auto pb-32 animate-in fade-in duration-700">
      {/* Team Config Section */}
      <section className="bg-white p-10 rounded-[3rem] border border-slate-200/60 shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black tracking-tighter">System Units</h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Configure global team behavior</p>
          </div>
          <Palette className="text-slate-200" size={32} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {allTeams.length === 0 ? (
            <div className="col-span-full py-20 text-center flex flex-col items-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Active Teams Defined</span>
            </div>
          ) => {
            const config = teamConfigs[team] || { days: [1,2,3,4,5], color: getTeamColor(team) };
            return (<div key={team} className="p-8 bg-[#F8FAFC] border border-slate-200/50 rounded-[2.5rem] transition-all hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/5 group">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex gap-4 items-center">
                    <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-sm border-2 border-white">
                       <input 
                        type="color" 
                        value={config.color} 
                        onChange={(e) => updateTeamConfig(team, { color: e.target.value })}
                        className="absolute inset-0 w-full h-full cursor-pointer scale-[2] transform origin-center"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-lg text-slate-800 uppercase tracking-tighter">{team}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Unit Schedule</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => updateTeamConfig(team, { days: config.days.length === 7 ? [] : [0,1,2,3,4,5,6] })}
                    className="text-[10px] font-black uppercase text-indigo-500 hover:text-indigo-700 transition-colors bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100/50"
                  >
                    {config.days.length === 7 ? 'Clear Shift' : 'Force Full'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {DAYS_SHORT.map((day, idx) => (<button 
                      key={day} 
                      onClick={() => toggleDay(team, idx)}
                      className={`h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        config.days.includes(idx) 
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-200' 
                          : 'bg-white text-slate-400 border-slate-200/60 hover:border-slate-300'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Agents Section */}
      <section className="bg-white p-10 rounded-[3rem] border border-slate-200/60 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black tracking-tighter">Identity Management</h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Resource allocation mapping</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            <button 
              onClick={onReset}
              className="flex items-center gap-2 px-6 py-3.5 text-rose-500 font-black text-[10px] uppercase tracking-widest bg-rose-50 hover:bg-rose-100 rounded-2xl transition-all border border-rose-100 active:scale-95"
            >
              <RefreshCw size={14} /> Global Wipe
            </button>
            <div className="relative flex-1 lg:min-w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Find Agent or Unit..." 
                className="pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200/50 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all w-full"
              />
            </div>
            <button 
              onClick={addNewAgent}
              className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 hover:-translate-y-0.5"
            >
              <Plus size={16} strokeWidth={3} /> Create Identity
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {filteredAgents.map(agent => (
            <div key={agent.id} className="p-8 bg-white rounded-[2.5rem] border border-slate-200/60 flex flex-col xl:flex-row gap-10 transition-all hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/5 group/card">
              <div className="flex-1 space-y-8">
                <div className="flex flex-wrap gap-4">
                  <div className="flex flex-col flex-1 min-w-[240px]">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Identity Name</label>
                    <input 
                      type="text" 
                      value={agent.name} 
                      onChange={(e) => updateAgent(agent.id, { name: e.target.value })}
                      className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 font-black text-sm text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div className="flex flex-col w-40">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Assigned Unit</label>
                    <input 
                      type="text" 
                      value={agent.team} 
                      placeholder="UNIT-X" 
                      onChange={(e) => updateAgent(agent.id, { team: e.target.value.toUpperCase() })}
                      className="bg-slate-50 p-4 rounded-2xl border-l-4 font-black text-xs uppercase text-slate-800 outline-none focus:bg-white transition-all"
                      style={{ borderLeftColor: getTeamColor(agent.team) }}
                    />
                  </div>
                </div>
                
                <div className="flex gap-12 px-2">
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Star size={10} className="fill-amber-400 text-amber-400" /> Priority Status</span>
                    <button 
                      onClick={() => updateAgent(agent.id, { isPriority: !agent.isPriority })}
                      className={`w-14 h-7 rounded-full p-1.5 transition-all relative ${agent.isPriority ? 'bg-indigo-600 shadow-md shadow-indigo-200' : 'bg-slate-200'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${agent.isPriority ? 'translate-x-7' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Lock size={10} className="text-blue-500" /> Freeze Allocation</span>
                    <button 
                      onClick={() => updateAgent(agent.id, { isFrozen: !agent.isFrozen })}
                      className={`w-14 h-7 rounded-full p-1.5 transition-all relative ${agent.isFrozen ? 'bg-blue-600 shadow-md shadow-blue-200' : 'bg-slate-200'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${agent.isFrozen ? 'translate-x-7' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="xl:w-[450px] space-y-4">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Market Configuration</span>
                {agent.marketConfigs.map((cfg, idx) => (<div key={idx} className="flex gap-3 items-center bg-[#F8FAFC] p-4 rounded-[1.5rem] border border-slate-200/50 relative group/item">
                    <div className="relative flex-1">
                      <button 
                        onClick={() => setOpenDropdown(openDropdown === `${agent.id}-${idx}` ? null : `${agent.id}-${idx}`)}
                        className="w-full bg-white border border-slate-200/60 rounded-xl px-4 py-3 flex justify-between items-center text-[10px] font-black uppercase tracking-wider"
                      >
                        <span className="truncate">{cfg.category}</span>
                        <ChevronDown size={14} className="text-slate-300" />
                      </button>
                      {openDropdown === `${agent.id}-${idx}` && (<div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto animate-in zoom-in-95">
                          {MARKET_CATEGORIES.map(m => (
                            <button 
                              key={m} 
                              onClick={() => {
                                const newConfigs = [...agent.marketConfigs];
                                newConfigs[idx].category = m;
                                updateAgent(agent.id, { marketConfigs: newConfigs });
                                setOpenDropdown(null);
                              }}
                              className="w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 border-b border-slate-100 last:border-0"
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 items-center w-20">
                      <input 
                        type="number" 
                        value={cfg.quota} 
                        onChange={(e) => {
                          const newConfigs = [...agent.marketConfigs];
                          newConfigs[idx].quota = Math.max(0, parseInt(e.target.value) || 0);
                          updateAgent(agent.id, { marketConfigs: newConfigs });
                        }}
                        className="w-full p-3 text-center font-black text-xs bg-white rounded-xl border border-slate-200/60 outline-none focus:border-indigo-500"
                      />
                    </div>
                    <button 
                      onClick={() => {
                        const newConfigs = agent.marketConfigs.filter((_, i) => i !== idx);
                        updateAgent(agent.id, { marketConfigs: newConfigs });
                      }}
                      className="p-2.5 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => {
                    const newConfigs = [...agent.marketConfigs, { category: MARKET_CATEGORIES[0], quota: 10 }];
                    updateAgent(agent.id, { marketConfigs: newConfigs });
                  }}
                  className="w-full py-4 text-[9px] font-black uppercase tracking-widest text-indigo-400 border-2 border-dashed border-indigo-100 rounded-[1.5rem] hover:bg-indigo-50/50 hover:border-indigo-300 transition-all"
                >
                  <Plus size={14} className="inline mr-2" /> Add Market Access
                </button>
              </div>

              <div className="flex items-center xl:border-l xl:border-slate-100 xl:pl-6">
                <button 
                  onClick={() => setAgents(prev => prev.filter(a => a.id !== agent.id))}
                  className="p-5 text-slate-200 hover:text-rose-600 hover:bg-rose-50 rounded-[1.5rem] transition-all group-hover/card:text-rose-200"
                >
                  <Trash2 size={24} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Admin;
