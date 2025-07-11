'use client';
import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Header from '@/components/Header';
import MobileSidebar from '@/components/MobileSidebar';
import { ProfileCustomization } from './ProfileCustomization';

const Settings: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, authenticated, ready } = usePrivy();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  if (!ready || !authenticated) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
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
        <div className="m-4 p-6">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-white mb-6">Creator Profile</h1>
            <ProfileCustomization />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
