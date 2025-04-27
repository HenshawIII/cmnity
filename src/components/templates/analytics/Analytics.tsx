"use client"

import { AnalyticCard } from "@/components/Card/Card"
import type React from "react"
import { useEffect, useMemo, useState } from "react"
import Header from "@/components/Header"
import MobileSidebar from "@/components/MobileSidebar"
import { usePrivy } from "@privy-io/react-auth"
import { useDispatch, useSelector } from "react-redux"
import { getAllStreams } from "@/features/streamAPI"
import { getAssets } from "@/features/assetsAPI"
import type { RootState, AppDispatch } from "@/store/store"
import type { Asset, Stream } from "@/interfaces"
import { useViewerMetrics } from "@/app/hook/useViewerMetrics"
import { Bars } from "react-loader-spinner"
import { usePlaybackMetrics } from "@/app/hook/usePlaybackView"
import { ChevronRight } from "lucide-react"
import Performance from "../analytics/Performance"

const Analytics = () => {
  const { user, ready, authenticated } = usePrivy()
  const dispatch = useDispatch<AppDispatch>()
  const { streams, loading: streamsLoading } = useSelector((state: RootState) => state.streams)
  const { assets, loading: assetsLoading, error: assetsError } = useSelector((state: RootState) => state.assets)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { viewMetrics, loading } = useViewerMetrics({ filter: "all" }) // Fetch view metrics

  const insightsData = [
    {
      title: "Total Views",
      views: viewMetrics?.viewCount ? viewMetrics?.viewCount : "---",
      change: "from all stream and assets",
    },
    {
      title: "Total Watch time",
      playtimeMins: viewMetrics?.playtimeMins
        ? `${Math.floor(viewMetrics.playtimeMins / 60)}h:${(viewMetrics.playtimeMins % 60).toFixed(1)}mins`
        : "0h:0.0m",
      change: "from all stream and assets",
    },
  ]

  useEffect(() => {
    if (ready && authenticated) {
      dispatch(getAllStreams())
      dispatch(getAssets())
    }
  }, [dispatch, ready, authenticated])

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const filteredStreams = useMemo(() => {
    return streams.filter((stream: Stream) => !!stream.playbackId && stream.creatorId?.value === user?.wallet?.address)
  }, [streams, user?.wallet?.address])

  const filteredAssets = useMemo(() => {
    return assets.filter((asset: Asset) => !!asset.playbackId && asset.creatorId?.value === user?.wallet?.address)
  }, [assets, user?.wallet?.address])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  // A small sub‐component so hooks rules aren't broken
  const MetricCard: React.FC<{ playbackId: string; name: string; type: "stream" | "asset" }> = ({
    playbackId,
    name,
    type,
  }) => {
    const { views, loading, error } = usePlaybackMetrics(playbackId)

    return (
      <div className="flex-shrink-0 w-[280px] border flex flex-col justify-between bg-background-gray border-border-gray rounded-lg p-4 gap-y-5 h-[180px]">
        <div>
          <p className="text-lg font-bold  capitalize break-words line-clamp-2">{name}</p>
          <p className="text-sm text-black-secondary-text capitalize">{type}</p>
        </div>
        {error ? (
          <p className="text-xs text-red-500">{error}</p>
        ) : (
          <div>
            
              <p className="text-4xl font-extrabold tracking-wide">{views?.viewCount ?? 0} Views</p>
           
            <p className="text-sm flex items-center gap-1">
              <span className="text-black-secondary-text">since start</span>
            </p>
          </div>
        )}
      </div>
    )
  }

  const SectionTitle = ({ title, count }: { title: string; count: number }) => (
    <div className="flex flex-col">
      <h2 className="text-lg font-bold text-black">{title}</h2>
      <p className="text-sm text-black-secondary-text">{count} items</p>
    </div>
  )

  const HorizontalScroll = ({
    title,
    count,
    children,
    emptyMessage,
  }: {
    title: string
    count: number
    children: React.ReactNode
    emptyMessage: string
  }) => (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <SectionTitle title={title} count={count} />
        {count > 0 && (
          <button className="text-sm text-blue-600 flex items-center">
            View all <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
      {count > 0 ? (
        <div className="relative">
          <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {children}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[180px] border border-dashed border-gray-300 rounded-lg bg-gray-50">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <MobileSidebar
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-auto">
        <Header toggleMenu={toggleMobileMenu} mobileOpen={mobileMenuOpen} />
        <div className="py-4 px-4 pb-10 md:py-6 flex flex-col gap-8 bg-white h-full">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row pt-4 justify-between">
              <h1 className="text-xl md:text-xl lg:text-2xl text-black font-bold">Analytics Dashboard</h1>
            </div>

            {/* Summary Cards */}
            <div className="grid bg-white grid-cols-2 gap-6 md:grid-cols-4 p-3 md:p-6 rounded-lg shadow-sm border border-border-gray">
              {insightsData.map((insightsData) => (
                <AnalyticCard key={insightsData.title} {...insightsData} />
              ))}
            </div>

            {/* Streams Section */}
            <HorizontalScroll
              title="Stream Metrics"
              count={filteredStreams.length}
              emptyMessage="No streams available. Start streaming to see metrics."
            >
              {filteredStreams.map((stream) => (
                <MetricCard key={stream.playbackId} playbackId={stream.playbackId!} name={stream.name} type="stream" />
              ))}
            </HorizontalScroll>

            {/* Assets Section */}
            <HorizontalScroll
              title="Asset Metrics"
              count={filteredAssets.length}
              emptyMessage="No assets available. Upload content to see metrics."
            >
              {filteredAssets.map((asset) => (
                <MetricCard key={asset.id} playbackId={asset.playbackId} name={asset.name} type="asset" />
              ))}
            </HorizontalScroll>

            {/* Performance Metrics */}
            <Performance metrics={viewMetrics || {}} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
