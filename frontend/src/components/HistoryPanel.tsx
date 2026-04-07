import { Clock } from 'lucide-react';

export default function HistoryPanel({ history }: { history: any[] }) {
  if (history.length === 0) return null;

  return (
    <div className="bg-[#050508] border border-[#232332] rounded-xl p-6 shadow-lg">
      <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase flex items-center gap-2 mb-4">
        <Clock size={16}/> Evaluation History
      </h3>
      <div className="space-y-3">
         {history.map((h, i) => (
            <div key={i} className="flex justify-between items-center bg-[#13131c] border border-[#1f1f2e] p-3 rounded-lg text-sm">
               <div>
                  <div className="font-mono text-gray-400 text-xs mb-1">cr:{h.credit} · inc:{h.income} · dbt:{h.debt}</div>
                  <div className="text-xs text-purple-400/70 font-mono truncate w-40">{h.commitment}</div>
               </div>
               <div className="text-right">
                  <div className={`text-xs font-bold ${h.approved ? 'text-teal-400' : 'text-red-400'}`}>{h.approved ? 'APPROVED' : 'REJECTED'}</div>
                  <div className="text-[10px] text-gray-600 mt-1">{h.ts}</div>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}
