import { useState, useEffect } from 'react';

interface SolPriceResponse {
  solana: {
    usd: number;
  };
}

export function useSolPrice() {
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSolPrice = async () => {
      try {
        setLoading(true);
        // Using CoinGecko API for SOL/USD price
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch SOL price');
        }
        
        const data: SolPriceResponse = await response.json();
        setSolPrice(data.solana.usd);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching SOL price:', err);
        setError(err.message);
        // Set a fallback price if API fails
        setSolPrice(150); // Approximate fallback
      } finally {
        setLoading(false);
      }
    };

    fetchSolPrice();
    
    // Refresh price every 30 seconds
    const interval = setInterval(fetchSolPrice, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Convert USD to SOL
  const usdToSol = (usdAmount: number): number | null => {
    if (!solPrice) return null;
    return usdAmount / solPrice;
  };

  return {
    solPrice,
    loading,
    error,
    usdToSol,
  };
}

