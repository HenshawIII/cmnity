'use client';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import React, { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { LuArrowLeftFromLine, LuArrowRightFromLine } from 'react-icons/lu';
import clsx from 'clsx';
import { X } from 'lucide-react';

const DashboardLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile screen
  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);

      // Automatically collapse the sidebar on mobile
      if (isMobileView) {
        setSidebarCollapsed(true);
      }
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    // Only toggle the sidebar if not in mobile view
    if (!isMobile) {
      setSidebarCollapsed((prev) => !prev);
    }
  };

  const toggleMobileMenu = () => {
    // Toggle the mobile menu
    setMobileMenuOpen((prev) => !prev);
  };

  return (
    <AuthGuard>
      <div className="text-white flex h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 font-sans">
        {/* Sidebar for desktop */}

        <aside
          className={clsx(
            'md:relative z-20 h-full md:block px-4 gap-y-4 transition-all duration-300 ease-in-out border-r border-white/20 flex flex-col bg-white/10 backdrop-blur-sm',
            {
              'w-[100px]': sidebarCollapsed && !isMobile, // Collapsed sidebar for desktop
              'w-72 p-4': !sidebarCollapsed && !isMobile, // Expanded sidebar for desktop
              hidden: isMobile && !mobileMenuOpen,
              block: isMobile && mobileMenuOpen,
            },
          )}
        >
          <div className="flex items-center justify-between py-4 border-b border-white/20">
            {!sidebarCollapsed && (
              <div className="transition-all ease-in-out duration-500 font-bold flex justify-center items-center uppercase text-white">
                <h1>Switch TV</h1>
              </div>
            )}
            <button onClick={toggleSidebar} className="ml-auto text-gray-300 hover:text-white transition-colors">
              {sidebarCollapsed ? (
                <LuArrowRightFromLine className="h-5 w-5" />
              ) : (
                <LuArrowLeftFromLine className="h-5 w-5" />
              )}
            </button>
          </div>
          <Sidebar sidebarCollapsed={sidebarCollapsed} />
        </aside>
        {/* Mobile menu overlay */}

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Pass state values as props to children */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="container mx-auto px-1">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
};

export default DashboardLayout;
