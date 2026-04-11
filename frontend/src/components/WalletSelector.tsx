import { useMidnight } from '../hooks/useMidnight';
import { Loader2, Wallet, LogOut, AlertCircle } from 'lucide-react';

export default function WalletSelector() {
  const { isConnected, isConnecting, error, connect, disconnect, availableWallets } = useMidnight();

  const handleConnect = () => {
    if (availableWallets.length > 0) {
      // If 'lace' is in the list, use it, otherwise use the first one found
      const target = availableWallets.includes('lace') ? 'lace' : availableWallets[0];
      connect(target);
    } else {
      // Try 'lace' by default and let the context show the 'not found' error
      connect('lace');
    }
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-400 font-mono">CONNECTED</span>
          <span className="text-sm font-medium text-teal-400">Lace Midnight</span>
        </div>
        <button 
          onClick={disconnect}
          className="p-2 bg-red-400/10 hover:bg-red-400/20 text-red-400 rounded-lg transition-colors border border-red-400/20"
          title="Disconnect Wallet"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        {error && (
          <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg border border-red-400/20">
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </div>
        )}
        <button 
          onClick={handleConnect} 
          disabled={isConnecting}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Connecting Lace...</span>
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4" />
              <span>Connect Lace Wallet</span>
            </>
          )}
        </button>
      </div>
      
      {availableWallets.length > 0 && !isConnected && !isConnecting && (
        <p className="text-[10px] text-gray-500 text-right">
          Detected: {availableWallets.join(', ')}
        </p>
      )}
    </div>
  );
}
