import { getPlaybackInfo } from '@/lib/livepeer';
import { getSrc } from '@livepeer/react/external';
import { PlayerLoading } from '@/components/templates/player/player/Player';
import PlayerWithChat from './PlayerWithChat';
import { PrivyProvider } from '@privy-io/react-auth';

export default async function PlayerPage({
  params,
  searchParams,
}: {
  params: { playbackId: string };
  searchParams: { streamName?: string; id: string };
}) {
  const { playbackId } = params;
  const { streamName, id } = searchParams;

  // Now you have both playbackId and streamId (and streamName) available!
  const inputSource = await getPlaybackInfo(playbackId);
  const src = getSrc(inputSource);

  return src ? (
    // <PrivyProvider
    //   appId={process.env.NEXT_PUBLIC_USER_PRIVY_ENVIRONMENT_ID ?? ''}
    //   config={{
    //     appearance: {
    //       landingHeader: '',
    //       loginMessage: 'Welcome to Chainfren TV',
    //       theme: 'light',
    //       accentColor: '#3351FF',
    //       showWalletLoginFirst: false,
    //       logo: 'https://res.cloudinary.com/dbkthd6ck/image/upload/v1737309623/chainfren_logo_eey39b.png',
    //     },
    //     loginMethods: ['email', 'google'],
    //     embeddedWallets: {
    //       createOnLogin: 'all-users',
    //     },
    //   }}
    // >
    <PlayerWithChat src={src} title={streamName ?? 'Live Stream'} playbackId={playbackId} id={id} />
  ) : (
    <PlayerLoading>
      <div className="absolute flex flex-col bg-black-secondary-text inset-0 justify-center items-center">
        <span className="text-sm text-white">Video is not available.</span>
        <span className="text-sm text-white">Please try refreshing the page in a few seconds.</span>
      </div>
    </PlayerLoading>
  );
}
