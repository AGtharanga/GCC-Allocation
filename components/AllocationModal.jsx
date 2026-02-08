import React from 'react';

import { Target, CheckCircle2, Globe } from 'lucide-react';
import { MARKET_COUNTRIES } from '../constants';

const AllocationModal = ({ agent, market, onClose, onConfirm }) => {
  const countries = MARKET_COUNTRIES[market] || [];

  return (<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Target size={32} />
          </div>
          <p className="text-2xl font-black text-slate-800 mb-1 tracking-tight">{agent.name}</p>
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-6">{agent.team || 'Sales Team'}</p>
          
          <div className="bg-slate-50 p-6 rounded-3xl mb-6 border border-slate-100 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Globe size={14} className="text-slate-400" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Confirming Allocation For</p>
            </div>
            <p className="text-xl font-black text-slate-800 mb-3">{market}</p>
            
            <div className="mt-3 pt-3 border-t border-slate-200/60">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Countries</p>
              <div className="max-h-32 overflow-y-auto custom-scroll">
                <div className="flex flex-wrap gap-1.5">
                  {countries.map((country, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 shadow-sm"
                    >
                      {country}
                    </span>
                  ))}
                  {countries.length === 0 && (
                    <span className="text-[10px] italic text-slate-400">No countries specified</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={onClose} 
              className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm} 
              className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <CheckCircle2 size={18} /> Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllocationModal;
