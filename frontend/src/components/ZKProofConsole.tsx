import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Circle, Loader2, TerminalSquare } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Local Witness Generation', desc: 'Parsing private data in local memory.' },
  { id: 2, title: 'Circuit Synthesis', desc: 'Translating AI model into cryptographic polynomials.' },
  { id: 3, title: 'Proof Generation', desc: 'Computing zk-SNARK prover to generate proof payload.' },
  { id: 4, title: 'On-Chain Verification', desc: 'Midnight Network blindly validating the arithmetic.' }
];

const MOCK_LOGS: any = {
  0: ["[System] Ready. Awaiting user initialization..."],
  1: [
    "> [Witness] Loading sensitive parameters into local memory...",
    "> [Witness] Evaluating creditHistoryFactor & incomeFactor...",
    "> [Witness] Witness scalars securely synthesized."
  ],
  2: [
    "> [Circuit] Booting Midnight Compact Logic...",
    "> [Circuit] Flattening AI decision threshold...",
    "> [Circuit] Compiling constraints..."
  ],
  3: [
    "> [Prover] Initiating Zero-Knowledge Prover...",
    "> [Prover] Computing cryptographic variables...",
    "> [Prover] ✅ ZK-Proof payload uniquely generated."
  ],
  4: [
    "> [Network] Broadcasting Proof to Midnight Testnet...",
    "> [Contract] Validators verifying math against public threshold...",
    "> [Contract] State Updated! AI Validation successful. PII remains completely hidden."
  ]
};

export default function ZKProofConsole({ currentStep, isSimulating }: { currentStep: number, isSimulating: boolean }) {
  const [logs, setLogs] = useState<string[]>(MOCK_LOGS[0]);
  const endOfLogsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logs.length > 1) {
      endOfLogsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    if (currentStep === 0) setLogs(MOCK_LOGS[0]);
    if (currentStep > 0 && currentStep <= 4) {
      const stepLogs = MOCK_LOGS[currentStep];
      let i = 0;
      const interval = setInterval(() => {
        if (i < stepLogs.length) {
          const l = stepLogs[i];
          setLogs(prev => [...prev, l]);
          i++;
        } else {
          clearInterval(interval);
        }
      }, 400);
      return () => clearInterval(interval);
    }
  }, [currentStep]);

  return (
    <div className="bg-[#050508] border border-[#232332] rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between pb-4 border-b border-[#1f1f2e] mb-6">
        <div>
          <h2 className="text-lg font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-400">
            Flow Stepper Console
          </h2>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* Stepper */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            {STEPS.map((step) => {
              const isActive = currentStep === step.id;
              const isPast = currentStep > step.id;
              
              return (
                <div key={step.id} className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-purple-900/10 border border-purple-500/30' : 'border border-transparent'}`}>
                  <div className="mt-0.5">
                    {isPast ? <CheckCircle2 className="text-teal-400" size={20} />
                            : isActive ? <Loader2 className="text-purple-400 animate-spin" size={20} />
                            : <Circle className="text-gray-700" size={20} />}
                  </div>
                  <div>
                    <h3 className={`text-sm font-semibold ${isActive ? 'text-purple-300' : isPast ? 'text-gray-300' : 'text-gray-600'}`}>{step.title}</h3>
                    <p className={`text-xs mt-1 ${isActive ? 'text-purple-200/50' : 'text-gray-600'}`}>{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Terminal */}
          <div className="flex flex-col bg-[#0a0a0f] border border-[#1f1f2e] rounded-xl overflow-hidden font-mono text-xs shadow-inner h-64">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#13131c] border-b border-[#1f1f2e]">
              <TerminalSquare size={14} className="text-gray-400" />
              <span className="text-[10px] tracking-wider text-gray-500 uppercase">Output</span>
            </div>
            <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
              {logs.map((log, index) => (
                <div key={index} className={`mb-1.5 ${log.includes('✅') || log.includes('Success') ? 'text-teal-400' : log.includes('error') ? 'text-red-400' : 'text-blue-300/70'}`}>
                  {log}
                </div>
              ))}
              {isSimulating && (
                <div className="flex mt-2 w-1.5 h-3 bg-purple-500 animate-pulse"></div>
              )}
              <div ref={endOfLogsRef} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
