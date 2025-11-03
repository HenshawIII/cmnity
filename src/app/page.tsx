'use client';
import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { getAllStreams } from '@/features/streamAPI';
import Hero from '@/components/templates/landing/Hero';
import Spinner from '@/components/Spinner';
import Image from 'next/image';
import Link from 'next/link';
import HorizontalNavbar from '@/components/HorizontalNavbar';

export default function LandingPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { ready, authenticated } = usePrivy();
  const { streams, loading } = useSelector((state: RootState) => state.streams);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // if (!ready) return;

    // Load streams for the showcase (no authentication required)
    dispatch(getAllStreams());
    setIsLoading(false);
  }, [ready, dispatch]);

  // // Show spinner while Privy is initializing
  // if (!ready || isLoading) {
  //   return <Spinner />;
  // }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col pb-20">
      <Hero />
      {/* Footer */}
     <footer className="border-t border-white/20 mt-12 pt-6 pb-2 px-4 w-full">
  <div className="flex flex-col items-center justify-center max-w-5xl mx-auto gap-4">
    {/* Twitter Link */}
    <Link href="https://twitter.com/yourtwitter" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
      <Image src="/assets/xpn.svg" alt="Twitter" width={28} height={28} />
    </Link>
    {/* Reach Out Button */}
    <button className="hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md transition-colors">
      Reach Out ?
    </button>
    {/* Switchtv Text */}
      <div className="text-center text-white text-sm mt-1">x402tv</div>
  </div>
  <HorizontalNavbar />
</footer>
    </div>
  );
}
