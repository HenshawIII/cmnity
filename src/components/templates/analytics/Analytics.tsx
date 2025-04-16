'use client';
import { AnalyticCard } from '@/components/Card/Card';
import { DatePickerWithRange } from '@/components/daterange';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { ChartComponent } from './Chart';
import { TopChart } from './topChatrt';
import Performance from './Performance';
import Header from '@/components/Header';
import MobileSidebar from '@/components/MobileSidebar';

const Analytics = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const analyticsCards = [
    { title: 'Total Views' },
    { title: 'Total Watch time' },
    { title: 'Average Watch Time' },
    { title: 'Peak Viewers' }
  ];

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
        <div className="py-4 px-4 pb-10 md:py-6 flex flex-col gap-10 bg-white h-full">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col md:flex-row pt-10 justify-between">
              <h1 className="text-xl md:text-xl lg:text-2xl text-black font-bold">Summary</h1>
              <div className="flex flex-wrap sm:items-center gap-3 md:gap-5 mt-3 md:mt-0">
                <Button className="bg-main-blue">All Channels</Button>
                <DatePickerWithRange />
                <Button className="bg-main-blue">All</Button>
                <Button className="bg-main-blue">This month</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {analyticsCards.map((card, index) => (
                <AnalyticCard
                  key={index}
                  title={card.title}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col lg:flex-col gap-5 w-full md:w-[70%]">
            <TopChart />
            <ChartComponent />
            <Performance />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
