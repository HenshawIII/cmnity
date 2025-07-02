'use client';
import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { getAllStreams } from '@/features/streamAPI';
import Hero from '@/components/templates/landing/Hero';
import StreamsShowcase from '@/components/templates/landing/StreamsShowcase';
import Spinner from '@/components/Spinner';
import Image from 'next/image';
import Link from 'next/link';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col">
      <Hero />
      <StreamsShowcase streams={streams} loading={loading} />
      {/* Footer */}
      <footer className="border-t border-white/20 mt-12 pt-6 pb-2 px-4 w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-5xl mx-auto gap-4">
          {/* Left: Twitter */}
          <Link href="https://twitter.com/yourtwitter" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            {/* Replace '/assets/twitter.png' with your provided image path */}
            <Image src="/assets/xpn.svg" alt="Twitter" width={28} height={28} />
            {/* <span className="text-white text-sm">Twitter</span> */}
          </Link>
          {/* Right: Reach Out button */}
          <button className=" hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md transition-colors">
            Reach Out ?
          </button>
        </div>
        {/* Centered Switchtv text */}
        <div className="text-center text-white text-sm mt-4">Switchtv</div>
      </footer>
    </div>
  );
}
