import axios from 'axios';
import { useCallback } from 'react';
import { useAccount } from 'wagmi';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';
import {
  Transaction,
  TransactionButton,
  TransactionSponsor,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
} from '@coinbase/onchainkit/transaction';
import type { LifecycleStatus } from '@coinbase/onchainkit/transaction';
import { usePrivy } from '@privy-io/react-auth';
import { Stream } from '@/app/hook/useStreamGate';

const clickContractAbi = [
  {
    type: 'function',
    name: 'click',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;

// Assuming `stream.playbackId` is your contract address:

export function StreamPayment({ stream, onPaid }: { stream: any; onPaid: (addr: string) => void }) {
  const { login, authenticated, ready } = usePrivy();
  const { address } = useAccount();

  const calls = [
    {
      //   address: stream.creatorId as `0x${string}`, // contract address
      to: stream?.creatorId as `0x${string}`, // contract address
      abi: clickContractAbi,
      functionName: 'click',
      args: [],
    },
  ];

  const handleOnStatus = useCallback(
    async (status: LifecycleStatus) => {
      if (status.statusName === 'success' && address) {
        // 1) register on your backend
        await axios.post('/addpayinguser', {
          playbackId: stream?.playbackId,
          userId: address,
        });
        // 2) let the parent know we’ve paid
        onPaid(address);
      }
    },
    [address, stream?.playbackId, onPaid],
  );

  // If they’re not logged into Privy yet, prompt them first.
  if (ready && !authenticated) {
    return (
      <button onClick={() => login()} className="w-full py-3 rounded bg-main-blue text-white">
        Login to Subscribe (${stream?.amount.toFixed(2)})
      </button>
    );
  }

  // Next, if they have no wallet, show the ConnectWallet UI
  if (!address) {
    return (
      <div className=" flex items-center justify-center h-full space-y-3 flex-col ">
        <h2 className="text-xl">🔒</h2>
        <p className="text-base text-center font-medium">{`A one-time fee of $${stream?.amount.toFixed(2) || '$$'} unlocks access to ${stream?.assetName || stream?.title || ''}.`}</p>

        {/* <Wallet>
        <ConnectWallet>
          <button className="w-full py-3 rounded bg-main-blue text-white">Connect Wallet</button>
        </ConnectWallet>
      </Wallet> */}
      </div>
    );
  }

  return (
    <div></div>
    // <Transaction
    //   chainId={1} // Ethereum Mainnet
    //   calls={calls}
    //   onStatus={handleOnStatus}
    // >
    //   <TransactionButton
    //     className="w-full py-3 rounded bg-main-blue text-white"
    //     text={`Pay ${stream.amount.toFixed(2)}`}
    //   />
    //   {/* Pay ${stream.amount.toFixed(2)} */}
    //   {/* </TransactionButton> */}
    //   <TransactionSponsor />
    //   <TransactionStatus>
    //     <TransactionStatusLabel />
    //     <TransactionStatusAction />
    //   </TransactionStatus>
    // </Transaction>
  );
}
