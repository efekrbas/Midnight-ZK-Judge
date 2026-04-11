import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { 
  type InitialAPI, 
  type ConnectedAPI 
} from '@midnight-ntwrk/dapp-connector-api';
import { 
  type PublicDataProvider, 
  type ProofProvider, 
  type ZKConfigProvider,
  type PrivateStateProvider
} from '@midnight-ntwrk/midnight-js-types';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { InMemoryPrivateStateProvider } from '../utils/midnightProviderUtils';

interface MidnightContextType {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  wallet: ConnectedAPI | null;
  availableWallets: string[];
  connect: (walletName?: string) => Promise<void>;
  disconnect: () => void;
  providers: {
    publicData: PublicDataProvider | null;
    proof: ProofProvider | null;
    zkConfig: ZKConfigProvider<string> | null;
    privateState: PrivateStateProvider | null;
  };
}

const MidnightContext = createContext<MidnightContextType | undefined>(undefined);

const INDEXER_URL = 'https://preprod-indexer.midnight.network';
const PROOF_SERVER_URL = 'http://localhost:6300';
const ZK_CONFIG_URL = typeof window !== 'undefined' ? `${window.location.origin}/zkir` : '/zkir';

export const MidnightProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<ConnectedAPI | null>(null);
  const [availableWallets, setAvailableWallets] = useState<string[]>([]);

  // Providers
  const [providers, setProviders] = useState<MidnightContextType['providers']>({
    publicData: null,
    proof: null,
    zkConfig: null,
    privateState: null
  });

  // 1. Detect available wallets
  useEffect(() => {
    const detectWallets = () => {
      const midnightSub = (window as any).midnight;
      const laceSub = (window as any).lace;
      
      const foundWallets: Record<string, InitialAPI> = {};

      // 1. Check window.midnight namespace
      if (midnightSub) {
        Object.keys(midnightSub).forEach(key => {
          const w = midnightSub[key];
          if (w && (typeof w.connect === 'function' || typeof w.enable === 'function')) {
            foundWallets[key] = w;
          }
        });
      }

      // 2. Check window.lace namespace (often used by Lace Midnight Edition)
      if (laceSub && laceSub.midnight && typeof laceSub.midnight.connect === 'function') {
        foundWallets['lace'] = laceSub.midnight;
      }

      const names = Object.keys(foundWallets);
      if (names.length > 0) {
        setAvailableWallets(names);
        console.log("[MidnightContext] Detected wallets:", names);
      }
    };

    detectWallets();
    const timer = setInterval(detectWallets, 1500);
    return () => clearInterval(timer);
  }, []);

  const connect = useCallback(async (walletName: string = 'lace') => {
    setIsConnecting(true);
    setError(null);
    try {
      const midnightSub = (window as any).midnight || {};
      const laceSub = (window as any).lace || {};
      
      // Try to find the connector in various possible locations
      let connector: InitialAPI | undefined = 
        midnightSub[walletName] || 
        (walletName === 'lace' ? laceSub.midnight : undefined);

      // If requested wallet not found, fallback to the first available one
      if (!connector) {
        const availableKeys = Object.keys(midnightSub).filter(k => 
          midnightSub[k] && (typeof midnightSub[k].connect === 'function' || typeof midnightSub[k].enable === 'function')
        );
        
        if (availableKeys.length > 0) {
          connector = midnightSub[availableKeys[0]];
          console.log(`[MidnightContext] Specific wallet '${walletName}' not found, falling back to '${availableKeys[0]}'`);
        } else if (laceSub.midnight && typeof laceSub.midnight.connect === 'function') {
          connector = laceSub.midnight;
          console.log(`[MidnightContext] Falling back to laceSub.midnight`);
        }
      }

      if (!connector) {
        throw new Error("Midnight wallet not found. Please ensure the Lace (Midnight edition) extension is installed, unlocked, and active.");
      }

      const walletApi: ConnectedAPI = await (typeof connector.connect === 'function' 
        ? connector.connect('preprod') 
        : (connector as any).enable());
      
      // Initialize Providers
      const publicData = indexerPublicDataProvider(INDEXER_URL, INDEXER_URL.replace(/^http/, 'ws') + '/subscriptions');
      const zkConfig = new FetchZkConfigProvider(ZK_CONFIG_URL, window.fetch.bind(window));
      const proof = httpClientProofProvider(PROOF_SERVER_URL, zkConfig);
      const privateState = new InMemoryPrivateStateProvider();

      setWallet(walletApi);
      setProviders({ publicData, proof, zkConfig, privateState });
      setIsConnected(true);
      
      console.log("[MidnightContext] Successfully connected to", walletName);
    } catch (err: any) {
      console.error("[MidnightContext] Connection error:", err);
      setError(err.message || 'Failed to connect to wallet');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setProviders({ publicData: null, proof: null, zkConfig: null, privateState: null });
  }, []);

  return (
    <MidnightContext.Provider value={{ 
      isConnected, 
      isConnecting, 
      error, 
      wallet, 
      availableWallets, 
      connect, 
      disconnect,
      providers
    }}>
      {children}
    </MidnightContext.Provider>
  );
};

export const useMidnight = () => {
  const context = useContext(MidnightContext);
  if (context === undefined) {
    throw new Error('useMidnight must be used within a MidnightProvider');
  }
  return context;
};
