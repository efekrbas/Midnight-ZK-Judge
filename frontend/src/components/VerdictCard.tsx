import { Check, X, Shield, Cpu } from 'lucide-react';

export default function VerdictCard({ verdict, threshold }: { verdict: any, threshold: number }) {
  if (!verdict) {
    return (
      <div className="bg-[#050508] border border-[#232332] rounded-xl p-8 text-center text-gray-500 flex flex-col items-center gap-3">
         <Cpu size={32} className="text-gray-600"/>
         <span className="text-sm">verdict will appear here after proof verification</span>
      </div>
    );
  }

  const { score, approved, blockNum } = verdict;

  return (
    <div className={`bg-[#050508] border rounded-xl p-6 shadow-lg transition-all duration-500 ${approved ? 'border-teal-500/50 shadow-[0_0_30px_rgba(45,212,191,0.15)]' : 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)]'}`}>
      <div className="flex justify-between items-center border-b border-[#1f1f2e] pb-4 mb-4">
         {approved ? (
            <span className="flex items-center gap-1 px-3 py-1 bg-teal-500/20 text-teal-400 rounded-md text-xs font-bold uppercase tracking-wider"><Check size={14}/> Verified</span>
         ) : (
            <span className="flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-md text-xs font-bold uppercase tracking-wider"><X size={14}/> Rejected</span>
         )}
         <span className="font-mono text-xs text-gray-500">block {blockNum}</span>
      </div>

      <div className="flex flex-col items-center py-6">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-3 h-3 rounded-full ${approved ? 'bg-teal-500 shadow-[0_0_10px_rgba(45,212,191,1)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)]'}`}></div>
          <h2 className={`text-3xl font-black tracking-widest ${approved ? 'text-teal-400' : 'text-red-400'}`}>
            {approved ? 'APPROVED' : 'REJECTED'}
          </h2>
        </div>
        <div className="text-gray-400 mt-2 font-mono flex items-center gap-3">
           <span>score: <strong className="text-white">{score}</strong></span>
           <span className="text-gray-600">|</span>
           <span>threshold: <strong className="text-white">{threshold}</strong></span>
        </div>
      </div>

      <div className="flex justify-between items-center bg-[#13131c] border border-[#1f1f2e] p-3 rounded-lg mt-2">
         <span className="text-gray-400 text-sm">On-Chain Proof Status</span>
         {approved ? <span className="text-teal-400 text-sm font-medium flex items-center gap-1"><Shield size={14}/> Validated</span>
                   : <span className="text-red-400 text-sm font-medium flex items-center gap-1"><X size={14}/> Validation Failed</span>}
      </div>
    </div>
  );
}
