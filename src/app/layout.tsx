import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import React from 'react';
const inter = Inter({ subsets: ['latin'] });
import './globals.css';
import Providers from './providers';
import { headers } from 'next/headers';
// import '@coinbase/onchainkit/styles.css';
// import { cookieToInitialState } from 'wagmi';
import getConfig from 'next/config';
import { SolanaProvider } from '@/context/solProv';

export const metadata: Metadata = {
  title: 'Switch TV',
  description: 'Switch TV',
  icons: {
    icon: './assets/images/favicon.ico',
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <SolanaProvider customRpcUrl="https://solana-mainnet.g.alchemy.com/v2/8rgdAH9Vy_zuXQFA2hedqK_a_3GAxvuZ">
        <Providers>
          <main>
            <Toaster position="top-center" richColors />
            {children}
          </main>
        </Providers>
        </SolanaProvider>
      </body>
    </html>
  );
}
