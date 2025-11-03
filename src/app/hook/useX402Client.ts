import { useMemo } from 'react';
import { createX402Client } from '@payai/x402-solana/client';
import { useWallet } from '@solana/wallet-adapter-react';
import { VersionedTransaction } from '@solana/web3.js';

export function useX402Client() {
  const { wallet, connected, publicKey } = useWallet();

  const client = useMemo(() => {
    if (!connected || !wallet?.adapter || !publicKey) {
      console.log('x402 client: Missing prerequisites', { connected, hasAdapter: !!wallet?.adapter, hasPublicKey: !!publicKey });
      return null;
    }

    try {
      const solanaAdapter = wallet.adapter as any;

      // Create a wallet adapter that implements the x402 WalletAdapter interface:
      // interface WalletAdapter {
      //   address: string;
      //   signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>;
      // }
      const x402WalletAdapter = {
        // Convert PublicKey to string address
        address: publicKey.toBase58(),
        
        // Sign VersionedTransaction
        signTransaction: async (tx: VersionedTransaction): Promise<VersionedTransaction> => {
          // Check if adapter supports signTransaction with VersionedTransaction
          if (solanaAdapter.signTransaction) {
            try {
              return await solanaAdapter.signTransaction(tx);
            } catch (error: any) {
              // If signTransaction fails, try signVersionedTransaction if available
              if (solanaAdapter.signVersionedTransaction) {
                return await solanaAdapter.signVersionedTransaction(tx);
              }
              throw error;
            }
          }
          
          // Fallback: try signVersionedTransaction directly
          if (solanaAdapter.signVersionedTransaction) {
            return await solanaAdapter.signVersionedTransaction(tx);
          }
          
          throw new Error('Wallet adapter does not support signing VersionedTransaction');
        },
      };

      console.log('x402 client: Creating client with adapter', {
        address: x402WalletAdapter.address,
        hasSignTransaction: typeof x402WalletAdapter.signTransaction === 'function',
      });

      return createX402Client({
        wallet: x402WalletAdapter,
        rpcUrl: 'https://solana-mainnet.g.alchemy.com/v2/8rgdAH9Vy_zuXQFA2hedqK_a_3GAxvuZ',
        network: 'solana',
        maxPaymentAmount: BigInt(10_000_000), // Optional: max 10 USDC
      });
    } catch (error) {
      console.error('Failed to create x402 client:', error);
      return null;
    }
  }, [wallet, connected, publicKey]);

  return client;
}

