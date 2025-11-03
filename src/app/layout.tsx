'use client';

// import type { Metadata } from 'next';
//  import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import React from 'react';
// const inter = Inter({ subsets: ['latin'] });
import './globals.css';
// import Providers from './providers';
// import { headers } from 'next/headers';
// import '@coinbase/onchainkit/styles.css';
// import { cookieToInitialState } from 'wagmi';
// import getConfig from 'next/config';
import { SolanaProvider } from '@/context/solProv';
import { PrivyProvider } from '@privy-io/react-auth';
import {Provider} from 'react-redux';
import store from '../store/store';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';

// export const metadata: Metadata = {
//   title: 'Switch TV',
//   description: 'Switch TV',
//   icons: {
//     icon: './assets/images/favicon.ico',
//   },
// };
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>x402tv</title>
        <meta name="description" content="x402 powered livestreaming on Solana" />
        <link rel="icon" href="/assets/images/favicon.ico" />
      </head>
      <body className={` antialiased`}>
      <SolanaProvider customRpcUrl="https://solana-mainnet.g.alchemy.com/v2/8rgdAH9Vy_zuXQFA2hedqK_a_3GAxvuZ">
          <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_ENVIRONMENT_ID ?? ''}
      config={{
        appearance: {
          landingHeader: '',
          loginMessage: 'Welcome to x402tv',
          theme: 'light',
          accentColor: '#3351FF',
          logo: 'https://res.cloudinary.com/dbkthd6ck/image/upload/v1737309623/chainfren_logo_eey39b.png',
          // showWalletLoginFirst: false,
          walletChainType:'solana-only',
          walletList: [ 'phantom'],
        
        },
        externalWallets: {solana: {connectors: toSolanaWalletConnectors()}},
        loginMethods:['wallet','email'],
      }}
    >
       
       <Provider store={store}>
          <main>
            <Toaster position="top-center" richColors />
            {children}
          </main>
         
        </Provider>
        </PrivyProvider>
        </SolanaProvider>
      </body>
    </html>
  );
}
