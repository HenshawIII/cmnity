import { useState, useEffect } from 'react';
import axios from 'axios';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import backendApi from '@/utils/backendApi';

export interface Stream {
  playbackId: string;
  creatorId: string;
  viewMode: 'free' | 'one-time' | 'monthly';
  amount: number;
  Users?: any[];
  description: string;
  streamName: string;
  logo: string;
  title: string;
  bgcolor: string;
  color: string;
  fontSize: string;
  fontFamily: string;
  donation: Array<number>;
}

export function useStreamGate(playbackId: string) {
  const [stream, setStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const { publicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();

  // 1️⃣ Fetch stream metadata
  useEffect(() => {
    if (!playbackId) return;
    setLoading(true);
    axios
      .get<{ stream: Stream }>(`https://chaintv.onrender.com/api/streams/getstream?playbackId=${playbackId}`)
      .then((res) => {
        setStream(res.data.stream);
        // auto‑open if free:
        if (res.data.stream.viewMode === 'free') {
          setHasAccess(true);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [playbackId]);

  // 2️⃣ Process payment when wallet is connected and stream is paid
  const processPayment = async (solAmount: number, recipientAddress: string) => {
    if (!stream || stream.viewMode === 'free' || hasAccess) return;
    if (!connected || !publicKey || !sendTransaction) {
      console.log('processPayment: Missing requirements', { connected, hasPublicKey: !!publicKey, hasSendTransaction: !!sendTransaction });
      throw new Error('Wallet not connected or transaction not supported');
    }

    // Validate recipient address
    let recipientPubkey: PublicKey;
    try {
      recipientPubkey = new PublicKey(recipientAddress);
    } catch (err) {
      throw new Error('Invalid recipient wallet address');
    }

    setProcessingPayment(true);
    try {
      console.log('processPayment: Processing payment', { 
        playbackId, 
        walletAddress: publicKey.toBase58(),
        solAmount,
        recipientAddress 
      });

      // Create transaction
      const transaction = new Transaction();
      
      // Add payment instruction
      const lamports = solAmount * LAMPORTS_PER_SOL;
      if (lamports <= 0) {
        throw new Error('Payment amount must be greater than 0');
      }
      
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubkey,
          lamports,
        })
      );

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      console.log('Transaction sent:', signature);

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, 'confirmed');

      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      console.log('Transaction confirmed:', signature);

      // Send payment info to backend
      try {
        await backendApi.post('/streams/payment', {
          playbackId,
          walletAddress: publicKey.toBase58(),
          transactionSignature: signature,
          solAmount,
          usdAmount: stream.amount,
        });
        console.log('Payment info sent to backend');
      } catch (backendError: any) {
        console.error('Failed to send payment info to backend:', backendError);
        // Don't fail the payment if backend call fails
      }

      // Grant access
      setHasAccess(true);
      markPaid(publicKey.toBase58());

      return { success: true, signature };
    } catch (err: any) {
      console.error('Payment processing failed:', err);
      throw new Error(err.message || 'Payment failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  // 3️⃣ If the user list already contains them, grant access (you'll call markPaid later)
  const markPaid = (userAddress: string) => {
    if (stream?.Users?.some((u) => u.userId === userAddress)) {
      setHasAccess(true);
    }
  };

  return { 
    stream, 
    loading, 
    error, 
    hasAccess, 
    setHasAccess, 
    markPaid, 
    processPayment, 
    processingPayment,
    walletReady: connected && !!publicKey,
  };
}

export function useGetStreamDetails(playbackId: string) {
  const [stream, setStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playbackId) return;
    setLoading(true);
    setError(null);

    axios
      .get<{ stream: Stream }>(`https://chaintv.onrender.com/api/streams/getstream?playbackId=${playbackId}`)
      .then((res) => setStream(res.data.stream))
      .catch((err) => setError(err.message || 'Failed to fetch stream'))
      .finally(() => setLoading(false));
  }, [playbackId]);

  return { stream, loading, error };
}
