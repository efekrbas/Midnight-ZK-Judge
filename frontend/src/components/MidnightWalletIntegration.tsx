import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
    setIsLoading(true);
    
    try {
      const wallet = getWalletProvider();
      
      if (!wallet) {
        throw new Error("Midnight wallet extension not found! Please install or unlock Lace/Midnight wallet.");
      }

      console.log("Found wallet provider:", wallet);
      
      // Robust check before enable to see if it's already enabled
      if (typeof wallet.isEnabled === 'function') {
         const enabled = await wallet.isEnabled();
         if (enabled) {
            console.log("Wallet already enabled.");
            setIsConnected(true);
            return;
         }
      }

      // Ensure the connection logic uses an async/await pattern with a proper abort signal
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
      
      const enablePromise = wallet.enable();
      const timeoutPromise = new Promise((_, reject) => {
        controller.signal.addEventListener('abort', () => reject(new Error("Connection timed out. Please check if the wallet pop-up was hidden or needs unlocking.")));
      });

      const api = await Promise.race([enablePromise, timeoutPromise]);
      clearTimeout(timeoutId);
      
      console.log("Wallet enable returned:", api);
      setIsConnected(true);
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      setError(`Error: ${err?.message || JSON.stringify(err) || String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-white font-medium">Lace Midnight Wallet</h3>
        {error && <p className="text-red-400 text-xs mt-1 max-w-[280px]">{error}</p>}
      </div>
      {!isConnected ? (
        <button 
          onClick={connectWallet} 
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white text-sm rounded-lg transition"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Connecting...
            </>
          ) : error ? (
            "Retry Connection"
          ) : (
            "Connect Wallet"
          )}
        </button>
      ) : (
        <div className="px-4 py-2 bg-teal-500/10 text-teal-400 border border-teal-500/30 text-sm rounded-lg font-medium">
           Connected
        </div>
      )}
    </div>
  );
}
