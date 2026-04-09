import { useState, useEffect } from 'react';

declare global {
  interface Window {
    midnight?: Record<string, {
      enable: () => Promise<any>;
      isEnabled: () => Promise<boolean>;
    }>
  }
}

export default function MidnightWalletIntegration({ onConnectChange }: { onConnectChange: (connected: boolean) => void }) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Propagate state upwards
  useEffect(() => {
    onConnectChange(isConnected);
  }, [isConnected, onConnectChange]);

  // Helper to dynamically find the injected wallet
  const getWalletProvider = (): any => {
    const pOptions = [];
    
    // 1. Midnight Specific
    if (window.midnight) {
      if (typeof (window.midnight as any).enable === 'function') pOptions.push(window.midnight);
      pOptions.push(window.midnight.mnLace, window.midnight.lace);
      for (const key of Object.keys(window.midnight)) pOptions.push((window.midnight as any)[key]);
    }
    
    // 2. Cardano Standard (Lace)
    if ((window as any).cardano) {
      const cardano = (window as any).cardano;
      pOptions.push(cardano.lace, cardano.mnLace);
    }
    
    // 3. Native root inject
    if ((window as any).lace) pOptions.push((window as any).lace);

    // Find the first option that has a valid .enable() method
    for (const p of pOptions) {
      if (p && typeof p.enable === 'function') return p;
    }
    
    return null;
  };

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const wallet = getWalletProvider();
        if (wallet) {
          const isEnabled = await wallet.isEnabled();
          if (isEnabled) {
            await wallet.enable();
            setIsConnected(true);
          }
        }
      } catch (err) {}
    };
    
    // Slight delay to ensure content scripts are fully loaded
    setTimeout(checkConnection, 300);
  }, []);

  const connectWallet = async () => {
    setError(null);
    try {
      const wallet = getWalletProvider();
      
      if (!wallet) {
        const mdKeys = window.midnight ? Object.keys(window.midnight).join(', ') : 'none';
        const cdKeys = (window as any).cardano ? Object.keys((window as any).cardano).join(', ') : 'none';
        setError(`Not found! window.midnight keys: [${mdKeys}], window.cardano keys: [${cdKeys}]`);
        return;
      }

      console.log("Found wallet provider:", wallet);
      
      // Prevent infinite hang by wrapping in a 5 second timeout
      const api = await Promise.race([
        wallet.enable(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout! Lace eklentisi 5 saniye icinde cevap vermedi (Arka planda senkronizasyon sorunu yasiyor olabilir).")), 5000))
      ]);
      
      console.log("Wallet enable returned:", api);
      setIsConnected(true);
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      setError(`Error: ${err?.message || JSON.stringify(err) || String(err)}`);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-white font-medium">Lace Midnight Wallet</h3>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>
      {!isConnected ? (
        <div className="flex gap-2">
          <button onClick={() => setIsConnected(true)} className="px-3 py-2 bg-[#1f1f2e] hover:bg-[#2a2a3e] text-gray-400 text-xs rounded-lg transition" title="Lace eklentiniz bozuksa simülasyon icin tetikleyin">
            Dev Bypass
          </button>
          <button onClick={connectWallet} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition">
            Connect
          </button>
        </div>
      ) : (
        <div className="px-4 py-2 bg-teal-500/10 text-teal-400 border border-teal-500/30 text-sm rounded-lg font-medium">
           Connected
        </div>
      )}
    </div>
  );
}
