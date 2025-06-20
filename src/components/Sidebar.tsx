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
    <nav className="w-full mt-2 ">
      <div className="flex flex-col gap-2">
        {links.map((link) => {
          const IconComponent = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link href={link.href} key={link.text}>
              <div
                className={clsx(
                  'flex items-center rounded-md py-3 gap-3 px-4',
                  isActive && 'bg-main-blue text-white',
                  sidebarCollapsed && 'justify-center',
                )}
              >
                <IconComponent className={'inline-block h-5 w-5 '} />

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

{
  /* <div className="flex flex-col p-2 gap-1">
<Link
  href="#"
  className={`flex items-center gap-3 p-3 rounded-md bg-[#3351ff] text-white font-medium ${sidebarCollapsed ? "justify-center" : ""}`}
>
  <Home className="h-5 w-5" />
  {!sidebarCollapsed && <span>Home</span>}
</Link>
<Link
  href="#"
  className={`flex items-center gap-3 p-3 rounded-md text-[#53525f] hover:bg-[#eeeff1] font-medium ${sidebarCollapsed ? "justify-center" : ""}`}
>
  <Video className="h-5 w-5" />
  {!sidebarCollapsed && <span>Stream</span>}
</Link>
<Link
  href="#"
  className={`flex items-center gap-3 p-3 rounded-md text-[#53525f] hover:bg-[#eeeff1] font-medium ${sidebarCollapsed ? "justify-center" : ""}`}
>
  <PenSquare className="h-5 w-5" />
  {!sidebarCollapsed && <span>Customize channel</span>}
</Link>
<Link
  href="#"
  className={`flex items-center gap-3 p-3 rounded-md text-[#53525f] hover:bg-[#eeeff1] font-medium ${sidebarCollapsed ? "justify-center" : ""}`}
>
  <PieChart className="h-5 w-5" />
  {!sidebarCollapsed && <span>Analytics</span>}
</Link>
<Link
  href="#"
  className={`flex items-center gap-3 p-3 rounded-md text-[#53525f] hover:bg-[#eeeff1] font-medium ${sidebarCollapsed ? "justify-center" : ""}`}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2v20M17 12H7" />
  </svg>
  {!sidebarCollapsed && <span>Monetization</span>}
</Link>
<Link
  href="#"
  className={`flex items-center gap-3 p-3 rounded-md text-[#53525f] hover:bg-[#eeeff1] font-medium ${sidebarCollapsed ? "justify-center" : ""}`}
>
  <Settings className="h-5 w-5" />
  {!sidebarCollapsed && <span>Settings</span>}
</Link>
</div> */
}
