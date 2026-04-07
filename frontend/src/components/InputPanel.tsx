import { Lock, EyeOff, CheckCircle2, ShieldAlert, AlertCircle } from 'lucide-react';

export default function InputPanel({ credit, setCredit, income, setIncome, debt, setDebt, threshold, status }: any) {
  
  const getBadge = () => {
    if (status === 'verified') return <span className="flex items-center gap-1 px-3 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-lg text-sm"><CheckCircle2 size={16}/> verified</span>
    if (status === 'rejected') return <span className="flex items-center gap-1 px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm"><AlertCircle size={16}/> rejected</span>
    if (status === 'pending') return <span className="flex items-center gap-1 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-sm"><ShieldAlert size={16}/> pending</span>
    return <span className="flex items-center gap-1 px-3 py-1 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded-lg text-sm"><Lock size={16}/> private</span>
  }

  return (
    <div className="bg-[#050508] border border-[#232332] rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase flex items-center gap-2">
          <Lock size={16} className="text-gray-400"/> Input — Private Witness
        </h3>
        {getBadge()}
      </div>

      <div className="space-y-4">
        {[
          { label: 'creditHistoryFactor', sub: 'Credit score component', val: credit, set: setCredit },
          { label: 'incomeFactor', sub: 'Monthly income (scaled)', val: income, set: setIncome },
          { label: 'debtFactor', sub: 'Debt-to-income (scaled)', val: debt, set: setDebt },
        ].map((item, idx) => (
          <div key={idx} className="flex justify-between items-center bg-[#13131c] border border-[#1f1f2e] p-4 rounded-lg">
            <div>
              <div className="font-mono text-purple-200">{item.label}</div>
              <div className="text-xs text-gray-500">{item.sub}</div>
            </div>
            <input 
              type="number" value={item.val} onChange={(e) => item.set(Number(e.target.value))}
              disabled={status === 'pending'}
              className="w-24 bg-[#0a0a0f] border border-[#232332] text-white px-3 py-2 rounded-md font-mono focus:outline-none focus:border-purple-500 transition disabled:opacity-50"
            />
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between items-center border-t border-[#1f1f2e] pt-4">
        <span className="text-gray-400 text-sm">Decision threshold (public)</span>
        <span className="font-mono text-lg font-bold text-white">{threshold}</span>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-amber-500/80 bg-amber-500/10 p-3 rounded-lg">
        <EyeOff size={16} />
        <span>witness data never leaves this device — only the proof is sent to the network</span>
      </div>
    </div>
  );
}
