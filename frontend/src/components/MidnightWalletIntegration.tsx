import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    midnight?: Record<string, {
      enable: (opts?: any) => Promise<any>;
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
    console.log("[DEBUG] Searching for wallet provider...");
    console.log("[DEBUG] window.midnight exists?", !!window.midnight);
    console.log("[DEBUG] window.cardano exists?", !!(window as any).cardano);
    
    const pOptions = [];
    
    // 1. Midnight Specific
    if (window.midnight) {
      if (typeof (window.midnight as any).enable === 'function') {
        console.log("[DEBUG] Found direct window.midnight.enable");
        pOptions.push(window.midnight);
      }
      if (window.midnight.mnLace) console.log("[DEBUG] Found window.midnight.mnLace");
      if (window.midnight.lace) console.log("[DEBUG] Found window.midnight.lace");
      
      pOptions.push(window.midnight.mnLace, window.midnight.lace);
      for (const key of Object.keys(window.midnight)) pOptions.push((window.midnight as any)[key]);
    }
    
    // 2. Cardano Standard (Lace)
    if ((window as any).cardano) {
      const cardano = (window as any).cardano;
      if (cardano.lace) console.log("[DEBUG] Found cardano.lace");
      if (cardano.mnLace) console.log("[DEBUG] Found cardano.mnLace");
      pOptions.push(cardano.lace, cardano.mnLace);
    }
    
    // 3. Native root inject
    if ((window as any).lace) {
       console.log("[DEBUG] Found window.lace");
       pOptions.push((window as any).lace);
    }

    // Find the first option that has a valid .enable() method
    for (const p of pOptions) {
      if (p && typeof p.enable === 'function') {
         console.log("[DEBUG] Selected provider:", p);
         return p;
      }
    }
    
    console.log("[DEBUG] No valid provider with .enable() found!");
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
    console.log("[DEBUG] === connectWallet flow initiated ===");
    setError(null);
    setIsLoading(true);
    
    try {
      const wallet = getWalletProvider();
      
      if (!wallet) {
        throw new Error("Midnight wallet extension not found! Please install or unlock Lace/Midnight wallet.");
      }
      
      // Robust check before enable to see if it's already enabled
      if (typeof wallet.isEnabled === 'function') {
         console.log("[DEBUG] Checking wallet.isEnabled()...");
         const enabled = await wallet.isEnabled();
         console.log("[DEBUG] wallet.isEnabled() returned:", enabled);
         if (enabled) {
            console.log("[DEBUG] Wallet is already enabled. Connecting...");
            setIsConnected(true);
            return;
         }
      }

      console.log("[DEBUG] Calling wallet.enable({ network: 'preprod' })....");
      // Ensure the connection logic uses an async/await pattern with a proper abort signal
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
         console.error("[DEBUG] 10s Time out reached! Aborting connection...");
         controller.abort();
      }, 10000); // 10 seconds timeout
      
      const enablePromise = wallet.enable({ network: 'preprod' }).catch(err => {
         console.error("[DEBUG] wallet.enable() threw an error:", err);
         throw err;
      });
      
      const timeoutPromise = new Promise((_, reject) => {
        controller.signal.addEventListener('abort', () => reject(new Error("Connection timed out. Please check if the wallet pop-up was hidden or needs unlocking.")));
      });

      const api: any = await Promise.race([enablePromise, timeoutPromise]);
      clearTimeout(timeoutId);
      
      console.log("[DEBUG] Enable succeeded! API Object:", api);
      
      // Validation: Enforce Preprod network
      if (api && typeof api.getNetworkId === 'function') {
         console.log("[DEBUG] Validating network ID...");
         const rawNetId = await api.getNetworkId();
         console.log("[DEBUG] API returned network ID:", rawNetId);
         
         const netStr = String(rawNetId).toLowerCase();
         // Note: Cardano based Preprod usually returns 0. Midnight might return 'preprod'.
         if (rawNetId !== 0 && netStr !== 'preprod' && netStr !== 'midnight-preprod') {
            console.error('[DEBUG] Validation failed: Network mismatch:', rawNetId);
            throw new Error(`Network mismatch: Received '${rawNetId}'. Please switch to Preprod`);
         }
      } else {
         console.log("[DEBUG] api.getNetworkId is not available on this provider.");
      }
      
      setIsConnected(true);
      console.log("[DEBUG] === connectWallet flow SUCCESS ===");
    } catch (err: any) {
      console.error("[DEBUG] === connectWallet flow FAILED ===");
      console.error(err);
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
