// 'use client';
// import React, { useCallback } from 'react';
// import { usePrivy } from '@privy-io/react-auth';
// import * as Dialog from '@radix-ui/react-dialog';
// import {
//   Transaction,
//   TransactionButton,
//   TransactionSponsor,
//   TransactionStatus,
//   TransactionStatusLabel,
//   TransactionStatusAction,
// } from '@coinbase/onchainkit/transaction';
// import { toast } from 'sonner';

// // Define the props for the donation dialog.
// // donorWalletId is the parent wallet address (passed as `id` prop in your Player page)
// // donationAmount is in your stable coin’s smallest unit (or as required by your call configuration)
// interface DonationDialogProps {
//   donationAmount: number;
//   streamTitle: string;
//   donorWalletId: string;
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
// }

// // For demonstration, we define a donation call that sends the donationAmount to a recipient.
// // Replace "0xDonationRecipientAddress" with your recipient address or logic.
// const createDonationCalls = (donationAmount: number) => {
//     const { user } = usePrivy();
//   return [
//     {
//       to: user?.wallet?.address , // Replace with your donation recipient address
//       value: donationAmount, // Make sure this is in the required unit (e.g. wei)
//       data: "0x", // If you need to pass data, do so here.
//     },
//   ];
// };

// export const DonationDialog: React.FC<DonationDialogProps> = ({
//   donationAmount,
//   streamTitle,
//   donorWalletId,
//   open,
//   onOpenChange,
// }) => {
//   // Handle status updates from the transaction.
//   const handleOnStatus = useCallback((status: any) => {
//     console.log('Transaction status:', status);
//     // You might want to add additional logic here. For example, on success, you could auto-close the dialog.
//     if (status.statusName === 'success') {
//       toast.success('Donation successful!');
//       onOpenChange(false);
//     }
//     if (status.statusName === 'error') {
//       toast.error('Donation failed, please try again.');
//     }
//   }, [onOpenChange]);

//   // Prepare the call parameters for the donation.
//   const donationCalls = createDonationCalls(donationAmount);

//   return (
//     <Dialog.Root open={open} onOpenChange={onOpenChange}>
//       <Dialog.Portal>
//         <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
//         <Dialog.Content className="fixed left-1/2 top-1/2 max-w-md w-[90vw] -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded shadow-lg">
//           <h2 className="text-xl font-bold mb-4">
//             Donate ${donationAmount} to {streamTitle}
//           </h2>
//           {/* Base Transaction Component */}
//           <Transaction
//             chainId={/* your Base chain id, e.g. BASE_SEPOLIA_CHAIN_ID */ 84531}
//             calls={donationCalls}
//             onStatus={handleOnStatus}
//           >
//             <TransactionButton />
//             <TransactionSponsor />
//             <TransactionStatus>
//               <TransactionStatusLabel />
//               <TransactionStatusAction />
//             </TransactionStatus>
//           </Transaction>
//           <Dialog.Close className="mt-4 inline-block text-blue-600 hover:underline">
//             Cancel
//           </Dialog.Close>
//         </Dialog.Content>
//       </Dialog.Portal>
//     </Dialog.Root>
//   );
// };
