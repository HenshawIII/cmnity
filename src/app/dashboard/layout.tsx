'use client';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import React, { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { Inter } from 'next/font/google';
import { LuArrowLeftFromLine, LuArrowRightFromLine } from 'react-icons/lu';
import clsx from 'clsx';
import { X } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

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
      <div className={`${inter.className} text-black-primary-text flex h-screen`}>
        {/* Sidebar for desktop */}

        <aside
          className={clsx(
            ' md:relative z-20 h-full md:block px-4 gap-y-4 transition-all duration-300 ease-in-out bg-white border-r border-[#dfe0e1] flex flex-col',
            {
              'w-[100px]': sidebarCollapsed && !isMobile, // Collapsed sidebar for desktop
              'w-72 p-4': !sidebarCollapsed && !isMobile, // Expanded sidebar for desktop
              hidden: isMobile && !mobileMenuOpen,
              block: isMobile && mobileMenuOpen,
            },
          )}
          // className={`${mobileMenuOpen ? "block" : "hidden"} md:block fixed md:relative z-20 h-full transition-all duration-300 ease-in-out ${sidebarCollapsed ? "w-[70px]" : "w-[200px]"} bg-white border-r border-[#dfe0e1] flex flex-col`}
        >
          <div className="flex items-center justify-between py-4 border-b border-[#dfe0e1]">
            {!sidebarCollapsed && (
              <div className=" transition-all ease-in-out duration-500 font-bold flex justify-center items-center uppercase text-black-primary-text">
                <h1>Creator Dashboard</h1>
              </div>
            )}
            <button onClick={toggleSidebar} className="ml-auto">
              {sidebarCollapsed ? (
                <LuArrowRightFromLine className="h-5 w-5 text-[#53525f]" />
              ) : (
                <LuArrowLeftFromLine className="h-5 w-5 text-[#53525f]" />
              )}
            </button>
          </div>
          <Sidebar sidebarCollapsed={sidebarCollapsed} />
        </aside>
        {/* Mobile menu overlay */}

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Pass state values as props to children */}
          <main className="flex-1 text-orange overflow-x-hidden overflow-y-auto bg-gray-50">
            <div className="container mx-auto px-1 ">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
};

export default DashboardLayout;
