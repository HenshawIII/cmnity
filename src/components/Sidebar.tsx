import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BsFillBarChartLineFill } from 'react-icons/bs';
import { CiStreamOn } from 'react-icons/ci';
import { FaSackDollar } from 'react-icons/fa6';
import { IoSettings } from 'react-icons/io5';
import { RiEditFill } from 'react-icons/ri';
import { TbHomeFilled } from 'react-icons/tb';

interface SidebarProps {
  sidebarCollapsed?: boolean;
}

const Sidebar = ({ sidebarCollapsed }: SidebarProps) => {
  const pathname = usePathname();
  const links = [
    { href: '/dashboard', icon: TbHomeFilled, text: 'Home' },
    // { href: '/dashboard/stream', icon: CiStreamOn, text: 'Stream' },
    // {
    //   href: '/dashboard/customise-channel',
    //   icon: RiEditFill,
    //   text: 'Customize Channel',
    // },
    // {
    //   href: '/dashboard/analytics',
    //   icon: BsFillBarChartLineFill,
    //   text: 'Analytics',
    // },

    // {
    //   href: '/dashboard/monetization',
    //   icon: FaSackDollar,
    //   text: 'Monetization',
    // },
    { href: '/dashboard/settings', icon: IoSettings, text: 'Profile' },
  ];
  return (
    <nav className="w-full mt-2  backdrop-blur-sm border border-white/20 rounded-lg p-2">
      <div className="flex flex-col gap-2">
        {links.map((link) => {
          const IconComponent = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link href={link.href} key={link.text}>
              <div
                className={clsx(
                  'flex items-center rounded-md py-3 gap-3 px-4 transition-all duration-200',
                  isActive 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/20',
                  sidebarCollapsed && 'justify-center',
                )}
              >
                <IconComponent className={'inline-block h-5 w-5'} />

                {!sidebarCollapsed && <p className="font-bold">{link.text}</p>}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
export default Sidebar;
