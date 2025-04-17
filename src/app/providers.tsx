'use client';
import { PrivyProvider } from '@privy-io/react-auth';
import { Provider } from 'react-redux';
import store from '../store/store';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { EthBalanceContextType } from '@/interfaces';
import { qMainnet, mainnet, metachain, baseSepolia } from 'viem/chains';
import { defineChain } from 'viem';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base } from 'wagmi/chains';
const EthBalanceContext = createContext<EthBalanceContextType | undefined>(undefined);

export const useEthBalance = () => {
  const context = useContext(EthBalanceContext);
  if (!context) {
    throw new Error('useEthBalance must be used within an EthBalanceProvider');
  }
  return context;
};

const EthBalanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { ready } = usePrivy();
  const { wallets } = useWallets();
  const [ethBalance, setEthBalance] = useState('');
  const [embeddedWallet, setEmbeddedWallet] = useState<any>(null);

  const refreshBalance = useCallback(async () => {
    if (!ready) return;
    const wallet = wallets[0];
    if (wallet) {
      try {
        const provider = await wallet.getEthereumProvider();
        // Get the current chain id (in hex)
        const ethProvider = new ethers.providers.Web3Provider(provider);
        const balance = await ethProvider.getBalance(wallet.address);
        const formattedBalance = ethers.utils.formatEther(balance);
        // console.log('Balance:', formattedBalance);
        setEthBalance(formattedBalance);
        setEmbeddedWallet(wallet);
      } catch (error) {
        // console.error('Error refreshing balance:', error);
      }
    }
  }, [ready, wallets]);

  useEffect(() => {
    refreshBalance();
  }, [ready, wallets, refreshBalance]);

  return (
    <EthBalanceContext.Provider value={{ ethBalance, embeddedWallet, refreshBalance }}>
      {children}
    </EthBalanceContext.Provider>
  );
};

export const ethereumMainnet = defineChain({
  id: 1, // Ethereum Mainnet chain ID
  name: 'Ethereum Mainnet',
  network: 'homestead', // This is the network name used for Ethereum Mainnet
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://cloudflare-eth.com'],
    },
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://etherscan.io' },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_ENVIRONMENT_ID ?? ''}
      config={{
        appearance: {
          landingHeader: '',
          loginMessage: 'Welcome to Chainfren TV',
          theme: 'light',
          accentColor: '#3351FF',
          showWalletLoginFirst: false,
          logo: 'https://res.cloudinary.com/dbkthd6ck/image/upload/v1737309623/chainfren_logo_eey39b.png',
          walletList: ['metamask', 'phantom', 'rainbow', 'wallet_connect', 'okx_wallet', 'bybit_wallet'],
        },
        loginMethods: ['email', 'wallet', 'google', 'twitter', 'discord', 'linkedin'],
        embeddedWallets: {
          createOnLogin: 'all-users',
        },
        defaultChain: ethereumMainnet,
        supportedChains: [ethereumMainnet, base, qMainnet, mainnet, metachain, baseSepolia],
      }}
    >
      <Provider store={store}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={base} // add baseSepolia for testing
        >
          <EthBalanceProvider>
            {/* <StreamProvider> */}
            {children}
            {/* </StreamProvider> */}
          </EthBalanceProvider>
        </OnchainKitProvider>
      </Provider>
    </PrivyProvider>
  );
}
