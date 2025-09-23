'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import MeetingRoom from '@/components/meetings/MeetingRoom';

const MeetingRoomPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const handleLeave = () => {
    router.push('/dashboard/meetings');
  };

  if (!roomId) {
    return <div>Invalid room ID</div>;
  }

  return (
    <MeetingRoom 
      roomId={roomId} 
      onLeave={handleLeave}
    />
  );
};

export default MeetingRoomPage;
