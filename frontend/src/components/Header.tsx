import { ShieldCheck } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex justify-between items-center py-4 border-b border-[#232332] mb-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-purple-900/30 border border-purple-500/50 rounded-xl flex items-center justify-center text-purple-400">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Midnight <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-400">ZK</span> Judge</h1>
          <p className="text-sm text-gray-400">Privacy-preserving AI verdict · ZK-ML Simulation</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
         <div className="flex items-center gap-2 px-4 py-2 bg-[#13131c] rounded-full border border-[#1f1f2e] text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
            <span className="text-gray-400">network · <span className="text-white">midnight-preprod</span></span>
         </div>
      </div>
    </header>
  );
}
