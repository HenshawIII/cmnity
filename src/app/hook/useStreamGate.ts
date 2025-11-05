import { useState, useEffect } from 'react';
import axios from 'axios';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import backendApi from '@/utils/backendApi';

export interface Stream {
  playbackId: string;
  creatorId: string;
  viewMode: 'free' | 'one-time' | 'monthly';
  amount: number;
  Users?: Array<{ payingUser: string }>;
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

  // 2️⃣ Check if viewer's wallet address is in the Users array or if viewer is the creator
  useEffect(() => {
    if (!stream || !publicKey || stream.viewMode === 'free') return;

    const walletAddress = publicKey.toBase58();
    
    // Check if viewer is the creator (owner of the stream)
    const isCreator = stream.creatorId?.toLowerCase() === walletAddress.toLowerCase();
    
    // Check if viewer has paid (is in Users array)
    const hasPaid = stream.Users?.some((user) => 
      user.payingUser?.toLowerCase() === walletAddress.toLowerCase()
    );

    // Grant access if viewer is the creator or has paid
    if (isCreator || hasPaid) {
      setHasAccess(true);
    }
  }, [stream, publicKey]);

  // 3️⃣ Process payment when wallet is connected and stream is paid
  const processPayment = async (solAmount: number, recipientAddress: string) => {
    if (!stream || stream.viewMode === 'free' || hasAccess) return;
    if (!connected || !publicKey || !sendTransaction) {
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
      console.log('Trying to send transaction', { solAmount, recipientAddress, playbackId });

      // Convert SOL to lamports, ensuring it's an integer
      // Use Math.floor to avoid decimal values that cause BigInt conversion errors
      const lamports = Math.floor(solAmount * 1e9);
      
      if (lamports <= 0) {
        throw new Error('Payment amount must be greater than 0');
      }

      // Create and send transaction (simplified like Player.tsx)
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubkey,
          lamports,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      console.log('Transaction sent successfully, signature:', signature);

      // Send payment info to backend (non-blocking)
      await axios.post('https://chaintv.onrender.com/api/streams/addpayinguser', {
        playbackId,
        walletAddress: publicKey.toBase58(),
        transactionSignature: signature,
        solAmount,
        usdAmount: stream.amount,
      }).catch((backendError: any) => {
        console.error('Failed to send payment info to backend:', backendError);
        // Don't fail the payment if backend call fails
      });

      // Grant access
      setHasAccess(true);
      markPaid(publicKey.toBase58());

      return { success: true, signature };
    } catch (err: any) {
      console.error('Payment processing failed:', err);
      throw new Error(err?.message || 'Payment failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  // 4️⃣ Helper function to check if user has paid (for after payment confirmation)
  const markPaid = (userAddress: string) => {
    if (stream?.Users?.some((u) => u.payingUser?.toLowerCase() === userAddress.toLowerCase())) {
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
