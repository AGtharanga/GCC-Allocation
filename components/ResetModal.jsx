import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

const ResetModal = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[110] animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] max-w-sm w-full p-10 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="text-center">
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-8 border border-rose-100">
            <AlertTriangle size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Reset System</h3>
          <p className="text-slate-500 text-sm font-medium mb-10">This will reset all current lead counts to zero for all agents. This action cannot be undone.</p>
          
          <div className="space-y-3">
            <button 
              onClick={onConfirm} 
              className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black shadow-lg hover:bg-rose-700 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Trash2 size={20} /> Confirm Reset
            </button>
            <button 
              onClick={onClose} 
              className="w-full py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Keep My Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetModal;
