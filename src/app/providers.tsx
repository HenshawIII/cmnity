// 'use client';
// import { PrivyProvider } from '@privy-io/react-auth';
// import { Provider } from 'react-redux';
// import store from '../store/store';
// import { createContext, useContext, useEffect, useState, useCallback } from 'react';

// import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';




// export default function Providers({ children }: { children: React.ReactNode }) {
//   return (
//     <PrivyProvider
//       appId={process.env.NEXT_PUBLIC_PRIVY_ENVIRONMENT_ID ?? ''}
//       config={{
//         appearance: {
//           landingHeader: '',
//           loginMessage: 'Welcome to Chainfren TV',
//           theme: 'light',
//           accentColor: '#3351FF',
//           showWalletLoginFirst: false,
//           logo: 'https://res.cloudinary.com/dbkthd6ck/image/upload/v1737309623/chainfren_logo_eey39b.png',
//           // showWalletLoginFirst: false,
//           walletChainType:'solana-only',
//           walletList: [ 'phantom'],
//         },
//         loginMethods: [ 'google','wallet', "farcaster" ],
//         externalWallets: {solana: {connectors: toSolanaWalletConnectors()}},
        
        
//       }}
//     >
//       <Provider store={store}>
        
       
//             {children}
           
      
//       </Provider>
//     </PrivyProvider>
//   );
// }
