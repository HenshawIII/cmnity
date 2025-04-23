import { useState, useEffect } from 'react';
import axios from 'axios';

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

  // 2️⃣ If the user list already contains them, grant access (you’ll call markPaid later)
  const markPaid = (userAddress: string) => {
    if (stream?.Users?.some((u) => u.userId === userAddress)) {
      setHasAccess(true);
    }
  };

  return { stream, loading, error, hasAccess, setHasAccess, markPaid };
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
