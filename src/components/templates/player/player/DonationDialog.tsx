// 'use client';

// import React, { useCallback } from 'react';
// import * as Dialog from '@radix-ui/react-dialog';
// import {
//   Transaction,
//   TransactionButton,
//   TransactionSponsor,
//   TransactionStatus,
//   TransactionStatusLabel,
//   TransactionStatusAction,
// } from '@coinbase/onchainkit/transaction';
// import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';
// import { useAccount } from 'wagmi';
// import { toast } from 'sonner';
// import { calls } from '@/components/baseOnchain/calls';

// interface DonationDialogProps {
//   donationAmount: number;
//   streamTitle: string;
//   // The creator address must be in the format "0x..." so that it satisfies the type requirement.
//   creatorAddress: `0x${string}`;
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
// }

// /**
//  * Helper function that returns an array of calls.
//  * This call will be used to trigger the donation transaction.
//  */
// // const createDonationCalls = (
// //   donationAmount: number,
// //   creatorAddress: `0x${string}`
// // ) => {
// //   return [
// //     {
// //       to: creatorAddress, // Use the creator's address (guaranteed to be defined)
// //       value: donationAmount, // The donation amount (ensure unit conversion as needed)
// //       data: '0x', // If you need to pass additional data, include it here.
// //     },
// //   ];
// // };

// export const DonationDialog: React.FC<DonationDialogProps> = ({
//   donationAmount,
//   streamTitle,
//   creatorAddress,
//   open,
//   onOpenChange,
// }) => {
//   // Retrieve the connected donor's wallet address using wagmi.
//   const { address: donorAddress } = useAccount();

//   // Handle the transaction lifecycle status.
//   const handleOnStatus = useCallback(
//     (status: any) => {
//       console.log('Transaction status:', status);
//       if (status.statusName === 'success') {
//         toast.success('Donation successful!');
//         onOpenChange(false);
//       }
//       if (status.statusName === 'error') {
//         toast.error('Donation failed, please try again.');
//       }
//     },
//     [onOpenChange]
//   );

//   // Create the calls using the provided donation amount and guaranteed creator address.
// //   const donationCalls = createDonationCalls(donationAmount, creatorAddress);
// // const calls = [...];
//   return (
//     <Dialog.Root open={open} onOpenChange={onOpenChange}>
//       <Dialog.Portal>
//         <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
//         <Dialog.Content className="fixed left-1/2 top-1/2 max-w-md w-[90vw] -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded shadow-lg">
//           <h2 className="text-xl font-bold mb-4">
//             Donate ${donationAmount} to {streamTitle}
//           </h2>
//           {donorAddress ? (

//             <Transaction
//               // Replace with your actual Base chain id.
//               chainId={84531}
//               calls={calls}
//               onStatus={handleOnStatus}
//             >
//               <TransactionButton />
//               <TransactionSponsor />
//               <TransactionStatus>
//                 <TransactionStatusLabel />
//                 <TransactionStatusAction />
//               </TransactionStatus>
//             </Transaction>
//           ) : (
//             // If the donor's wallet is not connected, prompt them to connect.
//             <Wallet>
//               <ConnectWallet>
//                 <div className="flex items-center space-x-2">
//                   <span className="text-sm text-gray-600">
//                     Please connect your wallet to donate.
//                   </span>
//                 </div>
//               </ConnectWallet>
//             </Wallet>
//           )}
//           <Dialog.Close className="mt-4 inline-block text-blue-600 hover:underline">
//             Cancel
//           </Dialog.Close>
//         </Dialog.Content>
//       </Dialog.Portal>
//     </Dialog.Root>
//   );
// };
