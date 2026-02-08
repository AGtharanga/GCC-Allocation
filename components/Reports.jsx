import React, { useState, useMemo } from 'react';

import { MARKET_CATEGORIES } from '../constants';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { Search, Download, RefreshCcw, TrendingUp, Users, Target } from 'lucide-react';

const Reports = ({ logs, agents, getTeamColor }) => {
  const [timeRange, setTimeRange] = useState('week');
  const [teamFilter, setTeamFilter] = useState('all');
  const [marketFilter, setMarketFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const uniqueTeams = useMemo(() => [...new Set(agents.map(a => a.team?.toUpperCase()).filter(Boolean))].sort(), [agents]);

  const filteredLogs = useMemo(() => {
    let filtered = [...logs];
    const now = new Date();

    if (timeRange === 'today') {
      filtered = filtered.filter(l => new Date(l.time).toDateString() === now.toDateString());
    } else if (timeRange === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      filtered = filtered.filter(l => new Date(l.time) >= weekAgo);
    }

    return filtered.filter(l => {
      const matchTeam = teamFilter === 'all' || l.team?.toUpperCase() === teamFilter;
      const matchMarket = marketFilter === 'all' || l.market === marketFilter;
      const matchSearch = !searchQuery || 
        l.agentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        l.team?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTeam && matchMarket && matchSearch;
    });
  }, [logs, timeRange, teamFilter, marketFilter, searchQuery]);

  // Analytics
  const teamDistData = useMemo(() => {
    const counts = {};
    filteredLogs.forEach(l => {
      const team = l.team?.toUpperCase() || 'UNASSIGNED';
      counts[team] = (counts[team] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredLogs]);

  const marketDistData = useMemo(() => {
    const counts = {};
    MARKET_CATEGORIES.forEach(m => counts[m] = 0);
    filteredLogs.forEach(l => {
      if (counts.hasOwnProperty(l.market)) counts[l.market]++;
    });
    return Object.entries(counts).map(([name, value]) => ({ 
      name: name.replace('Category ', ''), 
      value 
    }));
  }, [filteredLogs]);

  const flowData = useMemo(() => {
    const groups = {};
    [...filteredLogs].sort((a,b) => new Date(a.time).getTime() - new Date(b.time).getTime()).forEach(l => {
      const d = new Date(l.time);
      const key = timeRange === 'today' ? `${d.getHours()}:00` : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      groups[key] = (groups[key] || 0) + 1;
    });
    return Object.entries(groups).map(([time, count]) => ({ time, count }));
  }, [filteredLogs, timeRange]);

  const downloadCSV = () => {
    let csv = "Timestamp,Agent,Team,Market,Allocated By\n";
    filteredLogs.forEach(l => {
      csv += `"${l.time}","${l.agentName}","${l.team}","${l.market}","${l.allocatedBy}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GCC-Report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <main className="p-6 md:p-8 space-y-8 animate-in fade-in duration-700">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Leads', val: filteredLogs.length, icon: TrendingUp, color: 'indigo' },
          { label: 'Market Segments', val: MARKET_CATEGORIES.length, icon: Target, color: 'emerald' },
          { label: 'Active Teams', val: uniqueTeams.length, icon: Users, color: 'blue' },
          { label: 'Allocation Rate', val: `${Math.min(100, (filteredLogs.length / 500 * 100)).toFixed(1)}%`, icon: TrendingUp, color: 'amber' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm flex items-center gap-5 transition-transform hover:scale-[1.02]">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${stat.color}-50 text-${stat.color}-600`}>
              <stat.icon size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</span>
              <span className="text-2xl font-black text-slate-800 tracking-tighter">{stat.val}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200/60 shadow-sm flex flex-wrap items-center gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Timeline</label>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-black text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="today">Today</option>
            <option value="week">Past 7 Days</option>
            <option value="all">Cumulative</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Team Filter</label>
          <select 
            value={teamFilter} 
            onChange={(e) => setTeamFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-black text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Teams</option>
            {uniqueTeams.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category Filter</label>
          <select 
            value={marketFilter} 
            onChange={(e) => setMarketFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-black text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Markets</option>
            {MARKET_CATEGORIES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button 
            onClick={() => { setTimeRange('week'); setTeamFilter('all'); setMarketFilter('all'); setSearchQuery(''); }}
            className="flex items-center gap-2 px-6 py-2.5 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-indigo-600 transition-all"
          >
            <RefreshCcw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Allocation Volume</h3>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase">Real-time Data</span>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={flowData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" fontSize={10} fontVariant="bold" axisLine={false} tickLine={false} dy={10} />
                <YAxis fontSize={10} fontVariant="bold" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 'black', textTransform: 'uppercase', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm h-[400px] flex flex-col">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8">Team Distribution</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={teamDistData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60}
                  outerRadius={100} 
                  paddingAngle={5}
                  stroke="none"
                >
                  {teamDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getTeamColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {teamDistData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getTeamColor(d.name) }} />
                <span className="text-[8px] font-black uppercase text-slate-500">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col">
            <h2 className="font-black text-xl tracking-tighter">Audit Trail</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Immutable session history</p>
          </div>
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..." 
                className="pl-12 pr-4 py-3 bg-slate-50 border border-slate-200/50 rounded-2xl text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500/20 w-full md:w-72"
              />
            </div>
            <button 
              onClick={downloadCSV}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
            >
              <Download size={14} /> Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <tr>
                <th className="px-8 py-6">Identity</th>
                <th className="px-8 py-6">Operation</th>
                <th className="px-8 py-6">Target Team</th>
                <th className="px-8 py-6">Category</th>
                <th className="px-8 py-6">Timestamp</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100/60">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-500">
                        {log.agentName.charAt(0)}
                      </div>
                      <span className="font-black text-slate-800 tracking-tight">{log.agentName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-slate-400 font-bold uppercase tracking-widest">Lead Allocated</td>
                  <td className="px-8 py-6">
                    <span 
                      className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border" 
                      style={{ color: getTeamColor(log.team), borderColor: `${getTeamColor(log.team)}20`, backgroundColor: `${getTeamColor(log.team)}10` }}
                    >
                      {log.team}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                      {log.market}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 tracking-tight">{new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{new Date(log.time).toLocaleDateString()}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-20 text-center flex flex-col items-center">
                    <Search size={40} className="text-slate-200 mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No entries match your filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default Reports;
