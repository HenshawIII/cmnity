'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { getAssets } from '@/features/assetsAPI';
import { RootState, AppDispatch } from '@/store/store';
import image1 from '@/assets/image1.png';
import { StreamVideoCard, VideoStreamCard } from '@/components/Card/Card'; // Your video list item component
import type { Asset, Stream } from '@/interfaces';
import { VideoPlayer } from '@/components/templates/dashboard/VideoPlayer';
import { usePrivy } from '@privy-io/react-auth';
import { ColorRing } from 'react-loader-spinner';
import { getAllStreams, getStreamById } from '@/features/streamAPI';
import { id } from 'ethers/lib/utils';

const PlayerPage = () => {
  const { user } = usePrivy();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const streamId = searchParams.get('id')
  const dispatch = useDispatch<AppDispatch>();
  const playbackId = params?.playbackId as string;
  const { assets, loading, error } = useSelector((state: RootState) => state.assets);
  const { streams, error: streamError } = useSelector((state: RootState) => state.streams);
  const {stream} = useSelector((state: RootState) => state.streams);
  // State for products
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  // Fetch assets for video details
  useEffect(() => {
    dispatch(getAssets());
    dispatch(getAllStreams());
  }, [dispatch]);
  useEffect(() => {
    if (streamId) {
      console.log('streamjjjjjjjjjjjjjId', streamId)
      dispatch(getStreamById(streamId));
    }
  }, [id, dispatch]);
  console.log('streamj', stream);

  useEffect(() => {
    if (error) {
      toast.error('Failed to fetch assets: ' + error);
    }
  }, [error]);
  const creatorId = user?.wallet?.address;
  // Find the main asset (video) that matches the playbackId from the URL
  const mainAsset = useMemo(() => assets.find((asset) => asset.playbackId === playbackId), [assets, playbackId]);

  const filteredAssets = useMemo(() => {
    if (!mainAsset) return [];
    return assets.filter((asset: Asset) => !!asset.playbackId && asset.creatorId?.value === mainAsset.creatorId?.value);
  }, [assets, mainAsset]);

  const filteredStreams = useMemo(() => {
    return streams.filter((stream: Stream) => !!stream.playbackId && stream.creatorId?.value === creatorId);
  }, [streams, creatorId]);

  // When a video in the list is clicked, navigate to that video.
  const handleSelectVideo = (pbId: string) => {
    router.push(`/player/${pbId}`);
  };

  // Fetch products based on the creator's ID (from the main asset)
  useEffect(() => {
    if (mainAsset && mainAsset.creatorId?.value) {
      setProductsLoading(true);
      fetch(`https://chaintv.onrender.com/api/${mainAsset.creatorId.value}/products`)
        .then((res) => res.json())
        .then((data) => {
          setProducts(data.product || []);
        })
        .catch((err) => {
          setProductsError('Failed to load products. Please try again.');
          toast.error('Failed to load products. Please try again.');
        })
        .finally(() => {
          setProductsLoading(false);
        });
    }
  }, [mainAsset]);

  //    ? `${host.includes('localhost') ? 'http' : 'https'}://${host}/view/${playbackId}?streamName=${encodeURIComponent(streamName)}&id=${encodeURIComponent(creatorId)}`
  if (!mainAsset) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-semibold">
          <ColorRing
            visible={true}
            height="100"
            width="50"
            ariaLabel="color-ring-loading"
            wrapperStyle={{}}
            wrapperClass="color-ring-wrapper"
            colors={['#3351FF', '#3351FF', '#3351FF', '#3351FF', '#3351FF']}
          />
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Pane: Video List */}
          <aside className="lg:col-span-3">
            <div className="border rounded-lg p-4">
              <ul className="space-y-3 max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Available Stream</h3>
                {filteredStreams.map((stream) => (
                  <li key={stream.id}>
                    <button onClick={() => handleSelectVideo(stream.playbackId!)} className="w-full text-left">
                      <VideoStreamCard
                        streamName={stream.name}
                        playbackId={stream.playbackId!}
                        status={stream.isActive}
                        creatorId={stream.creatorId?.value || ''}
                        lastSeen={new Date(stream.lastSeen)}
                        imageUrl={image1}
                      />
                    </button>
                  </li>
                ))}
                <h3 className="text-lg font-semibold mb-4">Creator Videos</h3>
                {filteredAssets.map((video) => (
                  <li key={video.id}>
                    <button onClick={() => handleSelectVideo(video.playbackId!)} className="w-full text-left">
                      <StreamVideoCard
                        title={video.name}
                        playbackId={video.playbackId!}
                        assetData={video}
                        createdAt={new Date(video.createdAt)}
                        imageUrl={image1}
                        creatorId={video.creatorId?.value || ''}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main Player Area */}
          <main className="col-span-12 lg:col-span-6 flex flex-col space-y-4">
            {/* Video Player Component */}
            <VideoPlayer playbackId={playbackId} data={stream} />

            {/* Donation Section */}
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-semibold mb-2">Donate</h3>
              <div className="flex space-x-4">
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  onClick={() => alert('You donated $5!')}
                >
                  $5
                </button>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  onClick={() => alert('You donated $10!')}
                >
                  $10
                </button>
                <button
                  className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                  onClick={() => alert('You donated $20!')}
                >
                  $20
                </button>
              </div>
            </div>

            {/* Product Section */}
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-semibold mb-2">Products</h3>
              {productsLoading ? (
                <p>Loading products...</p>
              ) : productsError ? (
                <p className="text-red-500">{productsError}</p>
              ) : products.length === 0 ? (
                <p>No products available.</p>
              ) : (
                <div className="flex space-x-4 overflow-x-auto">
                  {products.map((product: any) => (
                    <div key={product.id} className="min-w-[200px] border rounded-lg p-4 flex flex-col items-center">
                      <img
                        src={typeof product.imageUrl === 'string' ? product.imageUrl : image1.src}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded"
                      />
                      <h4 className="mt-2 text-sm font-medium">{product.name}</h4>
                      <p className="text-sm text-gray-600">${product.price}</p>
                      <button
                        className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
                        onClick={() => alert(`You clicked on ${product.name}`)}
                      >
                        Buy Now
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>

          {/* Right Pane: Comments Section */}
          <div className="col-span-12 lg:col-span-3">
            <div className="border rounded-lg h-full flex flex-col">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-lg">Comments</h3>
              </div>
              {/* Additional comments content can be added here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerPage;
