// moodify\src\app\dashboard\page.tsx


'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';


const TrackPage = dynamic(() => import('@/app/dashboard/[trackId]/page'), { ssr: false });
import MusicDiscovery from './discover/page';

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trackId = searchParams.get('track');

  return (
    <>
      {trackId ? (
        <TrackPage params={{ trackId }} />
      ) : (
        <MusicDiscovery />
      )}
    </>
  );
}
