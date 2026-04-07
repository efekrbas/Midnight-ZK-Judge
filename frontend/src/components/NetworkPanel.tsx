import { CheckCircle2, Circle, Loader2, Network } from 'lucide-react';

export default function NetworkPanel({ currentStep }: { currentStep: number }) {
  const isLocalActive = currentStep >= 1;
  const isProofActive = currentStep >= 3;
  const isChainActive = currentStep >= 4;

  return (
    <div className="bg-[#050508] border border-[#232332] rounded-xl p-6 shadow-lg">
      <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-6 flex items-center gap-2">
        <Network size={16}/> Network Simulator
      </h3>
      <div className="flex items-center justify-between px-4">
        
        <div className="flex flex-col items-center gap-2">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${isLocalActive ? 'bg-teal-900/40 border-teal-500 shadow-[0_0_20px_rgba(45,212,191,0.4)] text-teal-300' : 'bg-[#13131c] border-[#1f1f2e] text-gray-600'}`}>
             <Circle size={24} fill="currentColor" />
          </div>
          <span className={`text-xs text-center ${isLocalActive?'text-teal-400':'text-gray-500'}`}>Local<br/>Prover</span>
        </div>

        <div className={`flex-1 h-1 transition-all duration-700 ${isProofActive ? 'bg-gradient-to-r from-teal-500 to-purple-500 shadow-[0_0_10px_rgba(147,51,234,0.5)]' : 'bg-[#1f1f2e]'}`}></div>

        <div className="flex flex-col items-center gap-2">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${isProofActive ? 'bg-purple-900/40 border-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.4)] text-purple-300' : 'bg-[#13131c] border-[#1f1f2e] text-gray-600'}`}>
             <CheckCircle2 size={24} />
          </div>
          <span className={`text-xs text-center ${isProofActive?'text-purple-400':'text-gray-500'}`}>ZK<br/>Proof</span>
        </div>

        <div className={`flex-1 h-1 transition-all duration-700 ${isChainActive ? 'bg-gradient-to-r from-purple-500 to-teal-500 shadow-[0_0_10px_rgba(45,212,191,0.5)]' : 'bg-[#1f1f2e]'}`}></div>

        <div className="flex flex-col items-center gap-2">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${isChainActive ? 'bg-teal-900/40 border-teal-500 shadow-[0_0_20px_rgba(45,212,191,0.4)] text-teal-300' : 'bg-[#13131c] border-[#1f1f2e] text-gray-600'}`}>
             <Loader2 size={24} className={currentStep===4 ? "animate-spin" : ""} />
          </div>
          <span className={`text-xs text-center ${isChainActive?'text-teal-400':'text-gray-500'}`}>Midnight<br/>Network</span>
        </div>

      </div>
    </div>
  );
}
