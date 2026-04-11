import { useState } from 'react';
import { Zap, X, Hash } from 'lucide-react';
import { useMidnight } from './hooks/useMidnight';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import ZKProofConsole from './components/ZKProofConsole';
import VerdictCard from './components/VerdictCard';
import NetworkPanel from './components/NetworkPanel';
import HistoryPanel from './components/HistoryPanel';
import WalletSelector from './components/WalletSelector';

function randomHex(len = 8) {
  return Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

export default function App() {
  const [credit, setCredit] = useState(110);
  const [income, setIncome] = useState(100);
  const [debt, setDebt] = useState(20);
  const THRESHOLD = 700;

  const [status, setStatus] = useState<'idle'|'pending'|'verified'|'rejected'>('idle');
  const [isSimulating, setIsSimulating] = useState(false);
  const { isConnected: isWalletConnected } = useMidnight();
  const [currentStep, setCurrentStep] = useState(0); 
  const [proofData, setProofData] = useState<{commitment: string, nullifier: string}|null>(null);
  const [verdict, setVerdict] = useState<{score: number, approved: boolean, blockNum: string}|null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const runProofFlow = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setStatus('pending');
    setProofData(null);
    setVerdict(null);
    setCurrentStep(0);

    // Step 1: Local Witness Setup
    setCurrentStep(1);
    await new Promise(r => setTimeout(r, 1000));

    // Step 2: Circuit Inference
    setCurrentStep(2);
    const score = (credit * 5) + (income * 3) - (debt * 4);
    await new Promise(r => setTimeout(r, 1000));

    // Step 3: Proof Generation
    setCurrentStep(3);
    await new Promise(r => setTimeout(r, 1500));
    const commitment = `0x${randomHex(8)}_${randomHex(4)}`;
    const nullifier = `0x${randomHex(8)}_${randomHex(4)}`;
    setProofData({ commitment, nullifier });
    
    // Step 4: Network Verif
    setCurrentStep(4);
    await new Promise(r => setTimeout(r, 1500));
    
    const approved = score > THRESHOLD;
    const blockNum = `#${Math.floor(4_800_000 + Math.random() * 50_000).toLocaleString()}`;
    setVerdict({ score, approved, blockNum });
    setStatus(approved ? 'verified' : 'rejected');
    
    setHistory(prev => [{ credit, income, debt, score, approved, commitment, blockNum, ts: new Date().toLocaleTimeString() }, ...prev]);
    
    setCurrentStep(5); // Complete
    setIsSimulating(false);
  };

  const resetAll = () => {
    setStatus('idle');
    setProofData(null);
    setVerdict(null);
    setCurrentStep(0);
    setIsSimulating(false);
  };

  return (
    <div className="min-h-screen bg-[#0c0c10] text-gray-300 font-sans p-6 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        <Header />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel */}
          <div className="space-y-6">
             <div className="bg-[#050508] border border-[#232332] rounded-xl p-6 shadow-lg">
                <WalletSelector />
             </div>

            <InputPanel 
              credit={credit} setCredit={setCredit}
              income={income} setIncome={setIncome}
              debt={debt} setDebt={setDebt}
              threshold={THRESHOLD}
              status={status}
            />

            {proofData ? (
               <div className="bg-[#050508] border border-[#232332] rounded-xl p-5 shadow-lg space-y-3">
                  <div className="text-sm font-semibold tracking-wider text-gray-500 uppercase">Proof Output</div>
                  <div className="flex justify-between text-sm bg-[#13131c] p-3 rounded-lg border border-[#1f1f2e]">
                     <span className="text-gray-400">commitment</span>
                     <span className="text-purple-400 font-mono">{proofData.commitment}</span>
                  </div>
                  <div className="flex justify-between text-sm bg-[#13131c] p-3 rounded-lg border border-[#1f1f2e]">
                     <span className="text-gray-400">nullifier</span>
                     <span className="text-purple-400 font-mono">{proofData.nullifier}</span>
                  </div>
                  <div className="flex justify-between text-sm bg-[#13131c] p-3 rounded-lg border border-[#1f1f2e]">
                     <span className="text-gray-400">witness</span>
                     <span className="text-gray-500 font-mono">[REDACTED]</span>
                  </div>
               </div>
            ) : (
                <div className="bg-[#050508] border border-[#232332] rounded-xl p-6 text-center text-gray-500 flex flex-col items-center gap-2">
                   <Hash size={24} />
                   <span className="text-sm">proof will appear here</span>
                </div>
            )}

            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={runProofFlow} disabled={isSimulating || !isWalletConnected}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                title={!isWalletConnected ? "Lütfen önce Wallet'ı bağlayın" : ""}
              >
                {isSimulating ? <Zap size={18} className="animate-pulse" /> : <Zap size={18} />} 
                {isSimulating ? "Proving..." : !isWalletConnected ? "Connect Wallet to Prove" : "Generate Proof"}
              </button>
              <button onClick={resetAll} disabled={isSimulating} className="flex items-center gap-2 px-6 py-3 bg-[#1f1f2e] hover:bg-[#2a2a3e] text-white rounded-lg transition disabled:opacity-50">
                <X size={18} /> Reset
              </button>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            <ZKProofConsole currentStep={currentStep} isSimulating={isSimulating} />
            
            <NetworkPanel currentStep={currentStep} />
            
            <VerdictCard verdict={verdict} threshold={THRESHOLD} />

            <HistoryPanel history={history} />
          </div>
        </div>
      </div>
    </div>
  );
}
