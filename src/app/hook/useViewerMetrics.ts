import api from '@/utils/api';
import { useCallback, useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { getDateRange } from '@/utils/dateUtils';

interface ViewMetricsProps {
  playbackId?: string;
  assetId?: string;
  streamId?: string;
  filter?: 'all' | 'month' | 'year'; // Default to "all"
  refreshInterval?: number;
}

interface ViewMetrics {
  viewCount?: number;
  playtimeMins?: number;
  ttffMs?: number;
  rebufferRatio?: number;
  errorRate?: number;
  exitsBeforeStart?: number;
}
// To get the view metrics for a specific playbackId, assetId, or streamId or overall when no filter param is passed
export const useViewerMetrics = ({
  playbackId,
  assetId,
  streamId,
  filter = 'all',
  refreshInterval = 10000,
}: ViewMetricsProps) => {
  const { user } = usePrivy();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMetrics, setViewMetrics] = useState<ViewMetrics>();

  // Memoized fetch function
  const fetchViewerMetrics = useCallback(async () => {
    if (!user) {
      setError('User is not authenticated');
      return;
    }

    try {
      setLoading(true);

      // Construct query parameters dynamically
      const { from, to } = getDateRange(filter);
      const params = new URLSearchParams();
      if (playbackId) params.append('playbackId', playbackId);
      if (assetId) params.append('assetId', assetId);
      if (streamId) params.append('streamId', streamId);
      if (user?.wallet?.address) params.append('creatorId', user.wallet.address);
      if (from) params.append('from', from.toString());
      if (to) params.append('to', to.toString());

      const response = await api.get(`/data/views/query?${params.toString()}`);

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      if (response.status === 200) {
        if (Array.isArray(response.data) && response.data.length === 0) {
          setViewMetrics({ viewCount: 0, errorRate: 0 });
        } else {
          setViewMetrics(response.data[0]);
        }
      } else {
        setViewMetrics({
          viewCount: 0,
          playtimeMins: 0,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch View Metrics');
      console.error('Error fetching viewer metrics:', err);
    } finally {
      setLoading(false);
    }
  }, [playbackId, assetId, streamId, filter, user]);

  // Initial fetch when component mounts or dependencies change
  useEffect(() => {
    fetchViewerMetrics();
  }, [fetchViewerMetrics]);

  // Set up interval for periodic refreshes
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return;

    const intervalId = setInterval(() => {
      fetchViewerMetrics();
    }, refreshInterval);

    // Clean up interval on unmount or when dependencies change
    return () => clearInterval(intervalId);
  }, [fetchViewerMetrics, refreshInterval]);

  return { viewMetrics, loading, error, refetch: fetchViewerMetrics };
};

// this get isntatenous viewer data
interface ViewMetricProps {
  playbackId: string;
  refreshInterval?: number;
}

interface ViewerMetrics {
  viewCount: number;
  errorRate: number;
}

// Currently this is used to get the current view count and error rate for a specific playbackId
export const useViewMetrics = ({ playbackId, refreshInterval = 5000 }: ViewMetricProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewerMetrics, setViewerMetrics] = useState<ViewerMetrics | null>(null);
  const { user } = usePrivy();

  // Create a memoized fetch function to avoid recreating it on each render
  const fetchViewMetrics = useCallback(async () => {
    if (!playbackId) {
      setError('Playback ID is required');
      return;
    }

    try {
      setLoading(true);
      const walletAddress = user?.wallet?.address || '';
      const queryParams = new URLSearchParams();

      if (playbackId) queryParams.append('playbackId', playbackId);
      if (walletAddress) queryParams.append('creatorId', walletAddress);

      const response = await api.get(`/data/views/now?${queryParams.toString()}`);

      if (response.status !== 200) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      if (response.status === 200) {
        if (Array.isArray(response.data) && response.data.length === 0) {
          setViewerMetrics({ viewCount: 0, errorRate: 0 });
        } else {
          setViewerMetrics(response.data[0]);
        }
      } else {
        setViewerMetrics({ viewCount: 0, errorRate: 0 });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch View Metrics');
      console.error('Error fetching view metrics:', err);
    } finally {
      setLoading(false);
    }
  }, [playbackId, user?.wallet?.address]);

  // Initial fetch when component mounts or dependencies change
  useEffect(() => {
    fetchViewMetrics();
  }, [fetchViewMetrics]);

  // Set up interval for periodic refreshes
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return;

    const intervalId = setInterval(() => {
      fetchViewMetrics();
    }, refreshInterval);

    // Clean up interval on unmount or when dependencies change
    return () => clearInterval(intervalId);
  }, [fetchViewMetrics, refreshInterval]);

  return { viewerMetrics, loading, error, refetch: fetchViewMetrics };
};
