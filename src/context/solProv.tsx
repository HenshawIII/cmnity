"use client";

import React, { FC, ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { SolflareWalletAdapter ,AlphaWalletAdapter,LedgerWalletAdapter} from "@solana/wallet-adapter-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";

interface SolanaProviderProps {
  children: ReactNode;
  customRpcUrl?: string; // Optional custom RPC URL
}

export const SolanaProvider: FC<SolanaProviderProps> = ({ children, customRpcUrl }) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Mainnet;

  // Use customRpcUrl if provided, otherwise use the default clusterApiUrl
  const endpoint = useMemo(
    () => customRpcUrl || clusterApiUrl(network),
    [customRpcUrl, network]
  );

  const wallets = useMemo(
    () => [
      new SolflareWalletAdapter(),
    //   new AlphaWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};