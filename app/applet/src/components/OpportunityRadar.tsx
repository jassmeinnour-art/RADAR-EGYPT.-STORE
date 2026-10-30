
import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, X, RefreshCw, Zap, TrendingUp } from 'lucide-react';
import { Opportunity, opportunityRadarService } from '../services/opportunityRadarService';

export const OpportunityRadar: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  useEffect(() => {
    const unsubscribe = opportunityRadarService.monitorOpportunities(setOpportunities);
    return () => unsubscribe();
  }, []);

  const handleAction = async (op: Opportunity) => {
    console.log('Performing action:', op.action);
    await opportunityRadarService.updateOpportunityStatus(op.id, 'resolved');
  };

  const handleIgnore = async (id: string) => {
    await opportunityRadarService.updateOpportunityStatus(id, 'ignored');
  };

  return (
    <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
          <Zap className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black text-white">رادار الفرص الذكي (مرصاد)</h2>
      </div>

      {opportunities.length === 0 ? (
        <p className="text-slate-400 text-sm">لا توجد فرص متاحة حالياً.</p>
      ) : (
        <div className="space-y-3">
          {opportunities.map(op => (
            <div key={op.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="text-amber-500 mt-1">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{op.title}</h4>
                  <p className="text-xs text-slate-400">{op.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleAction(op)}
                  className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30"
                  title="تنفيذ الإجراء"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleIgnore(op.id)}
                  className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                  title="تجاهل"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
