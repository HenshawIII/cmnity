'use client';
import React, { useState } from 'react';
import { useLinkAccount, usePrivy } from '@privy-io/react-auth';
import Header from '@/components/Header';
import { toast } from 'sonner';
import { FaSpinner } from 'react-icons/fa6';
import MobileSidebar from '@/components/MobileSidebar';
import { ProfileCustomization } from './ProfileCustomization';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

interface AccountItem {
  name: string;
  value: string | number | null | undefined;
  // The unlink method can accept either a string or a number.
  unlink: ((account: string) => Promise<any>) | ((account: number) => Promise<any>);
  type: 'string' | 'number';
}

const Settings: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const {
    user,
    authenticated,
    ready,

    unlinkEmail,

    unlinkGithub,
    unlinkGoogle,
    unlinkInstagram,

    unlinkPhone,

    unlinkTwitter,
    unlinkWallet,
    updateEmail,
    updatePhone,
    linkWallet,
    linkEmail,
    linkApple,
    linkDiscord,
    linkGithub,
    linkGoogle,
    linkPhone,
    linkTwitter,
  } = usePrivy();
  const [isLoading, setIsLoading] = useState(false);
  const linkOptions = [
    { label: 'Email', action: linkEmail },
    { label: 'Wallet', action: linkWallet },
    { label: 'Apple', action: linkApple },
    { label: 'Discord', action: linkDiscord },
    { label: 'Github', action: linkGithub },
    { label: 'Google', action: linkGoogle },
    { label: 'Phone', action: linkPhone },
    { label: 'Twitter', action: linkTwitter },
  ];
  // Define each account item along with the expected type.
  const accounts: AccountItem[] = [
    { name: 'Email', value: user?.email?.address, unlink: unlinkEmail, type: 'string' },
    { name: 'Wallet', value: user?.wallet?.address, unlink: unlinkWallet, type: 'string' },
    { name: 'Google', value: user?.google?.email, unlink: unlinkGoogle, type: 'string' },
    { name: 'Github', value: user?.github?.username, unlink: unlinkGithub, type: 'string' },
    { name: 'Instagram', value: user?.instagram?.username, unlink: unlinkInstagram, type: 'string' },
    { name: 'Phone', value: user?.phone?.number, unlink: unlinkPhone, type: 'number' },

    { name: 'Twitter', value: user?.twitter?.username, unlink: unlinkTwitter, type: 'string' },
    // { name: 'Wallet', value: user?.wallet?.address, unlink: unlinkWallet, type: 'string' },
  ];
  const [selectedLink, setSelectedLink] = useState<string>('');
  // A generic handler that accepts the correct type T (string or number)
  const handleUnlink = async <T extends string | number>(
    unlinkMethod: (account: T) => Promise<any>,
    accountValue: T,
  ) => {
    try {
      await unlinkMethod(accountValue);
      console.log(`${accountValue} unlinked successfully.`);
      // Optionally add UI feedback such as a success notification.
    } catch (error) {
      console.error(`Error unlinking account:`, error);
      // Optionally add UI feedback such as an error notification.
    }
  };

  const handleLinkClick = async () => {
    const selected = linkOptions.find((option) => option.label === selectedLink);
    if (selected) {
      setIsLoading(true);
      try {
        selected.action();
        // toast.success(``);
      } catch (error: any) {
        toast.error(error.message || `Failed to link ${selectedLink}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const {} = useLinkAccount({
    onSuccess: ({ linkMethod }) => {
      toast.success(`Successfully linked ${linkMethod}`);
    },
    onError: (error) => {
      toast.error(error.toUpperCase());
    },
  });
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  console.log('user', user);
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
        <div className="m-4 p-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="profile">Creator Profile</TabsTrigger>
              <TabsTrigger value="accounts">Linked Accounts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-4">
              <ProfileCustomization />
            </TabsContent>
            
            <TabsContent value="accounts" className="space-y-4">
              {/* Email Section */}
              <div className="flex w-full flex-col items-center justify-cente gap-x-8  py-6">
                <div className="flex flex-col w-full flex-1">
                  <label className="text-gray-700">Email</label>
                  <input
                    type="text"
                    name="email"
                    value={user?.email?.address || user?.google?.email}
                    // onChange={}
                    className={`border px-4 py-2 w-full md:w-1/2 outline-none border-[#DFE0E1] rounded-md bg-gray-100 pointer-events-none`}
                    readOnly
                  />
                </div>

                <div className="mt-4 py-6 w-full flex-1">
                  <h3 className="text-lg font-medium mb-4">Link New Account</h3>
                  <div className="flex gap-4 flex-wrap">
                    <select
                      value={selectedLink}
                      onChange={(e) => setSelectedLink(e.target.value)}
                      className="border rounded-lg px-4 py-2 focus:outline-none "
                    >
                      <option>Select an account to link</option>
                      {linkOptions.map((option, index) => (
                        <option key={index} value={option.label}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleLinkClick}
                      className="px-6 py-2 bg-main-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      {isLoading ? <FaSpinner className="text-white text-2xl" /> : 'Link Account'}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Linked Accounts Grid */}
              <h2 className="text-lg font-bold mb-4">Linked Accounts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {accounts.map((account, idx) => (
                  <div key={idx} className="flex flex-col min-h-30 justify-between border p-4 rounded-lg shadow-sm">
                    <p className="font-medium">{account.name}</p>
                    <p className="text-sm text-gray-600 whitespace-normal break-words">
                      {account.value ? account.value : 'Not linked'}
                    </p>
                    <button
                      disabled={!ready || !authenticated || !account.value}
                      onClick={() => {
                        if (account.value) {
                          if (account.type === 'number') {
                            handleUnlink(account.unlink as (account: number) => Promise<any>, account.value as number);
                          } else {
                            handleUnlink(account.unlink as (account: string) => Promise<any>, account.value as string);
                          }
                        }
                      }}
                      className="bg-red-500 text-white px-4 py-2 mt-2 rounded-md disabled:opacity-50"
                    >
                      Unlink
                    </button>
                  </div>
                ))}
                <button onClick={updateEmail} disabled={!ready || !authenticated || !user?.email}>
                  Update your email
                </button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;
