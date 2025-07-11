import Image from 'next/image';
import Chainfren_Logo from '../../public/assets/images/chainfren_logo.svg';
import { FaBars, FaSpinner } from 'react-icons/fa6';
import * as Avatar from '@radix-ui/react-avatar';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MdOutlineLogout } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { useLogout, usePrivy } from '@privy-io/react-auth';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { useEffect, useState } from 'react';
import { FaRegUserCircle, FaWallet, FaGoogle, FaDiscord, FaTwitter } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { IoClose } from 'react-icons/io5';
import { toast } from 'sonner';
// import { Avatar as Avater, Identity, Name, Badge, Address } from '@coinbase/onchainkit/identity';
import { Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { useDispatch } from 'react-redux';
import { setSolanaWalletAddress } from '@/features/userSlice';

const Header = ({ toggleMenu, mobileOpen }: { toggleMenu: () => void; mobileOpen: boolean }) => {
  const navigate = useRouter();
  const { user, ready } = usePrivy();
  const { wallets: solana, createWallet } = useSolanaWallets();
  const [solanaWallet, setSolanaWallet] = useState<string>('');
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  // Auto-create Solana wallet on login/ready
  useEffect(() => {
    if (!ready || !user) return;
    async function setUp() {
      let solanaWalletObj: { address: string } | undefined = solana.find((wallet) => wallet.walletClientType === 'privy');
      if (!solanaWalletObj) {
        try {
          setLoading(true);
          solanaWalletObj = await createWallet();
          toast.success('Solana wallet created successfully');
        } catch (error) {
          // toast.error('Failed to create Solana wallet');
        } finally {
          setLoading(false);
        }
      }
      if (solanaWalletObj) {
        setSolanaWallet(solanaWalletObj.address);
        dispatch(setSolanaWalletAddress(solanaWalletObj.address));
      }
    }
    setUp();
  }, [ready, solana, user, createWallet, dispatch]);

  const { logout: handleLogout } = useLogout({
    onSuccess: () => {
      toast.success('Successfully logged out');
      navigate.push('/');
    },
  });
  const [showWallets, setShowWallets] = useState(false);

  return (
    <>
      <header
        className={clsx('flex-1   w-full z-10 top-0 right-0 transition-all shadow-md duration-300 ease-in-out', {})}
      >
        <div className="flex justify-between items-center p-2 sm:p-5 bg-white/10 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
          <div className="flex items-center w-full flex-1 gap-3">
            <button onClick={toggleMenu} className="md:hidden">
              {mobileOpen ? <X className="h-7 w-7 text-white" /> : <Menu className="h-7 w-7 text-white" />}
            </button>
            <div className="  px-3 py-1.5 rounded-md ">
              {/* <Image src={Chainfren_Logo} alt={'header_Logo'} />
               */}
               <h1 className="text-2xl font-bold text-white">Switch TV</h1>
            </div>
          </div>
          {/* Avatar */}

          <div className="flex items-center flex-1 justify-end gap-4">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <div className="flex items-center gap-2">
                  {ready && (user?.wallet?.chainType === 'solana' || solanaWallet) ? (
                    <span className="text-purple-400 font-semibold">
                      {(user?.wallet?.chainType === 'solana' ? user.wallet.address : solanaWallet).slice(0, 6)}...
                      {(user?.wallet?.chainType === 'solana' ? user.wallet.address : solanaWallet).slice(-4)}
                    </span>
                  ) : (
                    <p className="text-gray-300">{ready && 'No wallet connected'}</p>
                  )}
                </div>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="min-w-[264px] rounded-md mr-2 z-10 bg-gray-900/95 backdrop-blur-sm border border-white/20 p-4 shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade"
                  sideOffset={5}
                >
                  {/* Profile Option */}
                  {/* <DropdownMenu.Item
                    className="group cursor-pointer px-3 relative flex gap-4 py-3 select-none items-center rounded-[3px] text-[13px] leading-none text-white outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-white/10 data-[disabled]:text-gray-400 data-[highlighted]:text-white"
                    onClick={() => setShowDialog(true)} // Open the dialog when "Profile" is clicked
                  >
                    <FaRegUserCircle className="text-lg text-white" />
                    <p className="text-white font-medium text-sm">Profile</p>
                  </DropdownMenu.Item> */}

                 

                  {/* Logout Option */}
                  <DropdownMenu.Item
                    className="group cursor-pointer px-3 relative flex gap-4 py-2 select-none items-center rounded-[3px] text-[13px] leading-none text-red-400 outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-white/10 data-[disabled]:text-gray-400 data-[highlighted]:text-red-300"
                    onClick={handleLogout}
                  >
                    <MdOutlineLogout className="text-xl text-red-400" />
                    <p className="text-red-400 font-medium ">Logout</p>
                  </DropdownMenu.Item>
                  {/* <hr className="my-3 border-[1px] border-white/20 " /> */}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            {/* Dialog for Profile Details */}
            <Dialog.Root open={showDialog} onOpenChange={setShowDialog}>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/80 animate-fade-in" />
                <Dialog.Content className="fixed inset-0 flex items-center justify-center p-4">
                  <div className="bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-xl mt-28 sm:ml-28 shadow-2xl p-6 w-full max-w-[850px] max-h-[80vh] overflow-y-auto relative">
                    <Dialog.Title className="text-2xl font-semibold border-b border-white/20 pb-4 mb-4 text-white">Profile Details</Dialog.Title>
                    {/* Profile Details Content */}
                    <div className="grid fex flex-col grid-cols-2  lg:grid-cols-3 gap-4">
                      {/* Solana Wallet Only */}
                      <div className="col-span-2 lg:col-span-3">
                        <div className="flex justify-between items-center">
                          <span className="text-purple-400 text-base">Solana Wallet Address:</span>
                          <button
                            onClick={() => setShowWallets((prev) => !prev)}
                            className="px-3 py-1 border border-white/20 bg-white/10 backdrop-blur-sm rounded text-sm text-white hover:bg-white/20 transition-colors"
                          >
                            {showWallets ? 'Hide Wallet' : 'Show Wallet'}
                          </button>
                        </div>
                        {showWallets && (
                          <div className="mt-4 space-y-4">
                            <div className="flex flex-col">
                              <span className="text-purple-400 text-base">Solana Wallet Address:</span>
                              <div className="flex items-center gap-2 mt-1">
                                <input
                                  type="text"
                                  readOnly
                                  value={solanaWallet || ''}
                                  className="border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 w-full text-white"
                                />
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(solanaWallet || '');
                                    toast.success('Copied to clipboard');
                                  }}
                                  className="px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-colors"
                                >
                                  Copy
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      {/* User ID Card */}
                      <div className="p-4 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm hover:border-purple-400 transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                          <FaRegUserCircle className="text-2xl text-purple-400" />
                          <span className="font-medium text-white">User ID</span>
                        </div>
                        <p className="text-sm text-gray-300 break-words">{user?.id}</p>
                      </div>
                      {/* Wallet Card */}
                      <div className="p-4 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm hover:border-purple-400 transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                          <FaWallet className="text-2xl text-purple-400" />
                          <span className="font-medium text-white">Wallet Address</span>
                        </div>
                        <p className="text-sm text-gray-300 break-words">{solanaWallet || 'Not connected'}</p>
                      </div>
                      {/* Email Card */}
                      <div className="p-4 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm hover:border-purple-400 transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                          <MdEmail className="text-2xl text-purple-400" />
                          <span className="font-medium text-white">Email</span>
                        </div>
                        <p className="text-sm text-gray-300 break-words">{user?.email?.address || 'Not connected'}</p>
                      </div>
                      {/* Google Card */}
                      <div className="p-4 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm hover:border-purple-400 transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                          <FaGoogle className="text-2xl text-purple-400" />
                          <span className="font-medium text-white">Google</span>
                        </div>
                        <p className="text-sm text-gray-300 break-words">{user?.google?.email || 'Not connected'}</p>
                      </div>
                      {/* Discord Card */}
                      <div className="p-4 rounded-lg border border-gray-200 hover:border-blue-500 transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                          <FaDiscord className="text-2xl text-main-blue" />
                          <span className="font-medium text-gray-700">Discord</span>
                        </div>
                        <p className="text-sm text-gray-600 break-words">
                          {user?.discord?.username || 'Not connected'}
                        </p>
                      </div>
                      {/* Twitter Card */}
                      <div className="p-4 rounded-lg border border-gray-200 hover:border-blue-500 transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                          <FaTwitter className="text-2xl text-main-blue" />
                          <span className="font-medium text-gray-700">Twitter</span>
                        </div>
                        <p className="text-sm text-gray-600 break-words">
                          {user?.twitter?.username || 'Not connected'}
                        </p>
                      </div>
                    </div>
                    <Dialog.Close className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <IoClose className="text-xl" />
                    </Dialog.Close>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
