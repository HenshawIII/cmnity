import axios from 'axios';
import { useEffect, useState } from 'react';
export interface Video {
  playbackId: string;
  viewMode: string;
  amount: number;
  assetName: string;
  creatorId: string;
  donation: number[];
  Users: any[];
}

export function useGetAssetGate(playbackId: string) {
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  useEffect(() => {
    if (!playbackId) return;
    setLoading(true);
    setError(null);

    axios
      .get<{ video: Video }>(`https://chaintv.onrender.com/api/videos/getvideo?playbackId=${playbackId}`)
      .then((res) => {
        setVideo(res.data.video);
        // auto‑open if free:
        if (res.data.video.viewMode === 'free') {
          setHasAccess(true);
        }
      })
      .catch((err) => setError(err.message || 'Failed to fetch video'))
      .finally(() => setLoading(false));
  }, [playbackId]);
  // 2️⃣ If the user list already contains them, grant access (you’ll call markPaid later)
  const markPaid = (userAddress: string) => {
    if (video?.Users?.some((u) => u.userId === userAddress)) {
      setHasAccess(true);
    }
  };
  return { video, loading, error, hasAccess, setHasAccess, markPaid };
}
