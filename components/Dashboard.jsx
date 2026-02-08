import React, { useState, useMemo } from 'react';

import { MARKET_CATEGORIES, DAYS_FULL } from '../constants';
import { ChevronDown, Target, Clock, Filter, AlertCircle } from 'lucide-react';

const Dashboard = ({ 
  agents, 
  activeMarket, 
  activeDayIdx, 
  setActiveMarket, 
  setActiveDayIdx, 
  onAllocate,
  getTeamColor,
  teamConfigs
}) => {
  const [showMarketDropdown, setShowMarketDropdown] = useState(false);
  const [showDayDropdown, setShowDayDropdown] = useState(false);

  const activeAgents = useMemo(() => agents.filter(a => {
    const config = a.marketConfigs.find(c => c.category === activeMarket);
    const teamName = a.team?.toUpperCase() || "UNASSIGNED";
    const sched = teamConfigs[teamName]?.days || [1, 2, 3, 4, 5];
    return config && config.quota > 0 && sched.includes(activeDayIdx);
  }), [agents, activeMarket, activeDayIdx, teamConfigs]);

  const teams = useMemo(() => [...new Set(activeAgents.map(a => a.team?.toUpperCase() || 'UNASSIGNED'))].sort(), [activeAgents]);

  return (<main className="p-6 md:p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-wrap items-center gap-4 mb-10">
        <div className="flex bg-white p-2 rounded-2xl border border-slate-200/60 shadow-sm gap-2">
          {/* Market Dropdown */}
          <div className="relative">
            <button 
              onClick={() => { setShowMarketDropdown(!showMarketDropdown); setShowDayDropdown(false); }}
              className="min-w-[200px] h-12 bg-slate-50 hover:bg-white border border-slate-200/50 rounded-xl px-4 flex justify-between items-center transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  <Target size={16} className="text-indigo-600" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Market</span>
                  <span className="text-xs font-black text-slate-800 tracking-tight leading-none">{activeMarket}</span>
                </div>
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${showMarketDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showMarketDropdown && (<div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in zoom-in-95">
                {MARKET_CATEGORIES.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => { setActiveMarket(cat); setShowMarketDropdown(false); }}
                    className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-wider hover:bg-indigo-50 transition-colors border-b border-slate-100 last:border-0 ${activeMarket === cat ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-600'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Day Dropdown */}
          <div className="relative">
            <button 
              onClick={() => { setShowDayDropdown(!showDayDropdown); setShowMarketDropdown(false); }}
              className="min-w-[180px] h-12 bg-slate-50 hover:bg-white border border-slate-200/50 rounded-xl px-4 flex justify-between items-center transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <Clock size={16} className="text-amber-600" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Shift</span>
                  <span className="text-xs font-black text-slate-800 tracking-tight leading-none">{DAYS_FULL[activeDayIdx]}</span>
                </div>
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${showDayDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showDayDropdown && (<div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in zoom-in-95">
                {DAYS_FULL.map((day, idx) => (<button 
                    key={day} 
                    onClick={() => { setActiveDayIdx(idx); setShowDayDropdown(false); }}
                    className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-wider hover:bg-amber-50 transition-colors border-b border-slate-100 last:border-0 ${activeDayIdx === idx ? 'text-amber-600 bg-amber-50/50' : 'text-slate-600'}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="ml-auto flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-slate-200/60 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{activeAgents.length} Agents Online</span>
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-10 items-start gap-8 custom-scroll">
        {teams.length === 0 ? (
          <div className="w-full flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <AlertCircle size={48} className="text-slate-300 mb-4" />
            <h3 className="text-xl font-black text-slate-400 uppercase tracking-tighter">No Active Agents Found</h3>
            <p className="text-slate-400 text-sm font-medium">Try changing the market or shift filter</p>
          </div>
        ) => {
          const teamColor = getTeamColor(team);
          const teamAgents = activeAgents.filter(a => (a.team?.toUpperCase() || 'UNASSIGNED') === team)
            .sort((a, b) => {
              if (a.isFrozen !== b.isFrozen) return a.isFrozen ? 1 : -1;
              if (a.isPriority !== b.isPriority) return a.isPriority ? -1 : 1;
              return a.name.localeCompare(b.name);
            });

          const teamTotalQuota = teamAgents.reduce((sum, a) => sum + (a.marketConfigs.find(c => c.category === activeMarket)?.quota || 0), 0);
          const teamTotalCurrent = teamAgents.reduce((sum, a) => sum + (a.marketCurrents[activeMarket] || 0), 0);
          const teamPct = teamTotalQuota > 0 ? Math.min(100, Math.round((teamTotalCurrent / teamTotalQuota) * 100)) : 0;

          return (
            <div key={team} className="min-w-[360px] w-[360px] bg-[#EEF2F6] border border-slate-200/60 rounded-[2.5rem] overflow-hidden flex flex-col max-h-[75vh] shadow-sm">
              <div className="p-8 text-white relative overflow-hidden" style={{ backgroundColor: teamColor }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <span className="uppercase tracking-tighter font-black text-2xl">{team}</span>
                    <div className="flex flex-col items-end">
                      <span className="text-4xl font-black tracking-tighter">{teamPct}%</span>
                      <span className="text-[10px] opacity-70 font-black uppercase tracking-widest mt-1">{teamTotalCurrent} / {teamTotalQuota} Leads</span>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-black/10 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-white transition-all duration-1000 ease-out rounded-full shadow-sm" style={{ width: `${teamPct}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-4">
                {teamAgents.map(agent => {
                  const current = agent.marketCurrents[activeMarket] || 0;
                  const quota = agent.marketConfigs.find(c => c.category === activeMarket)?.quota || 0;
                  const isFull = current >= quota;
                  const progress = quota > 0 ? (current / quota) * 100 : 0;

                  return (<div 
                      key={agent.id}
                      onClick={() => !agent.isFrozen && onAllocate(agent.id, activeMarket)}
                      className={`group relative bg-white p-5 rounded-3xl border border-slate-200/50 transition-all duration-300 cursor-pointer shadow-sm active:scale-[0.97] ${
                        isFull ? 'bg-slate-50 opacity-60' : 'hover:translate-y-[-4px] hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-200'
                      } ${agent.isFrozen ? 'cursor-not-allowed bg-slate-100 grayscale' : ''}`}
                    >
                      {agent.isPriority && (
                        <div className="absolute top-0 right-0 mt-3 mr-3">
                          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col">
                          <h4 className="font-black text-slate-800 text-sm tracking-tight truncate pr-2 group-hover:text-indigo-600 transition-colors">{agent.name}</h4>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Account Manager</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-black text-slate-700">{current}</span>
                          <span className="text-[10px] text-slate-400 font-bold tracking-widest"> / {quota}</span>
                        </div>
                      </div>

                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner mb-4">
                        <div 
                          className="h-full rounded-full transition-all duration-700 ease-out shadow-sm" 
                          style={{ backgroundColor: teamColor, width: `${progress}%` }} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        {agent.isFrozen ? (
                          <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            Session Frozen
                          </span>
                        ) : isFull ? (
                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                            Quota Full
                          </span>
                        ) : (
                          <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                            Accepting Leads
                          </span>
                        )}
                        
                        {agent.updatedAt && (
                          <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">
                            Last: {new Date(agent.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};

export default Dashboard;
