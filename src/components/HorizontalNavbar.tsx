'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TbHomeFilled } from 'react-icons/tb';
import { CiStreamOn } from 'react-icons/ci';
import { BsFillBarChartLineFill } from 'react-icons/bs';
import { FaRegUserCircle } from 'react-icons/fa';
import clsx from 'clsx';

interface HorizontalNavbarProps {
  className?: string;
}

const HorizontalNavbar = ({ className }: HorizontalNavbarProps) => {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: TbHomeFilled,
    },
    {
      name: 'Streams',
      href: '/streamviews',
      icon: CiStreamOn,
    },
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: BsFillBarChartLineFill,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: FaRegUserCircle,
    },
  ];

  return (
    <nav className={clsx(
      'fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg',
      className
    )}>
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 min-w-[60px]',
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                )}
              >
                <Icon className={clsx(
                  'w-6 h-6 mb-1',
                  isActive ? 'text-blue-600' : 'text-gray-600'
                )} />
                <span className={clsx(
                  'text-xs font-medium',
                  isActive ? 'text-blue-600' : 'text-gray-600'
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default HorizontalNavbar;
