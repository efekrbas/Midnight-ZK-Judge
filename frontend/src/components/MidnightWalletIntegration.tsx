import { useState, useEffect } from 'react';

declare global {
  interface Window {
    midnight?: Record<string, {
      enable: () => Promise<any>;
      isEnabled: () => Promise<boolean>;
    }>
  }
}

export default function MidnightWalletIntegration() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
    const wallet = getWalletProvider();
    
    if (!wallet) {
      setError("Midnight wallet extension not found. Is it enabled?");
      return;
    }
    try {
      await wallet.enable();
      setIsConnected(true);
    } catch (err: any) {
      setError(err?.message || "Connection rejected.");
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-white font-medium">Lace Midnight Wallet</h3>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>
      {!isConnected ? (
        <button onClick={connectWallet} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition">
          Connect
        </button>
      ) : (
        <div className="px-4 py-2 bg-teal-500/10 text-teal-400 border border-teal-500/30 text-sm rounded-lg font-medium">
           Connected
        </div>
      )}
    </div>
  );
}
