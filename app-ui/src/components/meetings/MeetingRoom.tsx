'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  App, 
  Typography, 
  Button, 
  Card, 
  Space, 
  Avatar,
  Badge,
  Tooltip,
  Row,
  Col,
  Spin
} from 'antd';
import {
  PhoneOutlined,
  VideoCameraOutlined,
  VideoCameraAddOutlined,
  AudioOutlined,
  AudioMutedOutlined,
  DesktopOutlined,
  MessageOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useMeetingSocket } from '@/hooks/useMeetingSocket';
import { apiClient } from '@/lib/api';
import { Meeting } from '@/types/meeting';
import VideoPlayer from './VideoPlayer';

const { Title, Text } = Typography;

interface MeetingRoomProps {
  roomId: string;
  onLeave?: () => void;
}

const MeetingRoom: React.FC<MeetingRoomProps> = ({ roomId, onLeave }) => {
  const router = useRouter();
  const { message } = App.useApp();
  
  // State
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  
  // WebRTC hook
  const {
    localStream,
    remoteStream,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    connectionState,
    startLocalStream,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    cleanup: cleanupWebRTC,
  } = useWebRTC({
    onRemoteStream: (stream) => {
      console.log('📡 Received remote stream');
    },
    onConnectionStateChange: (state) => {
      console.log('🔗 Connection state:', state);
      if (state === 'connected') {
        message.success('Connected to participant');
      } else if (state === 'failed') {
        message.error('Connection failed');
      }
    },
    onError: (error) => {
      message.error(error);
    },
  });
  
  // Meeting socket hook
  const {
    connected: socketConnected,
    participants,
    joinMeeting,
    leaveMeeting,
    sendWebRTCOffer,
    sendWebRTCAnswer,
    sendWebRTCIceCandidate,
    sendParticipantUpdate,
    sendChatMessage,
    startScreenShare: notifyScreenShareStart,
    stopScreenShare: notifyScreenShareStop,
  } = useMeetingSocket({
    roomId,
    onParticipantJoined: async (participant) => {
      console.log('👤 Participant joined:', participant);
      message.info(`${participant.userEmail} joined the meeting`);
      
      if (localStream) {
        try {
          const offer = await createOffer();
          sendWebRTCOffer(participant.userId, offer);
        } catch (error) {
          console.error('Error creating offer for new participant:', error);
        }
      }
    },
    onParticipantLeft: (participant) => {
      console.log('👤 Participant left:', participant);
      message.info(`Participant left the meeting`);
      
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.delete(participant.userId);
        return newMap;
      });
    },
    onWebRTCOffer: async (data) => {
      console.log('📡 Received WebRTC offer from:', data.fromUserId);
      try {
        const answer = await createAnswer(data.offer);
        sendWebRTCAnswer(data.fromUserId, answer);
      } catch (error) {
        console.error('Error creating answer:', error);
      }
    },
    onWebRTCAnswer: async (data) => {
      console.log('📡 Received WebRTC answer from:', data.fromUserId);
      try {
        await setRemoteDescription(data.answer);
      } catch (error) {
        console.error('Error setting remote description:', error);
      }
    },
    onWebRTCIceCandidate: async (data) => {
      console.log('📡 Received ICE candidate from:', data.fromUserId);
      try {
        await addIceCandidate(data.candidate);
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    },
    onScreenShareStarted: (data) => {
      message.info('Screen sharing started');
    },
    onScreenShareStopped: (data) => {
      message.info('Screen sharing stopped');
    },
    onError: (error) => {
      message.error(error);
    },
  });
  
  // Memoize participants count to prevent re-renders
  const participantsCount = useMemo(() => participants?.length || 0, [participants?.length]);
  
  // Load meeting data
  useEffect(() => {
    const loadMeeting = async () => {
      try {
        setLoading(true);
        const meetingData = await apiClient.getMeetingByRoomId(roomId);
        setMeeting(meetingData);
      } catch (error) {
        console.error('Error loading meeting:', error);
        message.error('Failed to load meeting');
        router.push('/dashboard/meetings');
      } finally {
        setLoading(false);
      }
    };

    loadMeeting();
  }, [roomId]); // ✅ Chỉ phụ thuộc vào roomId
  
  // Initialize local stream
  useEffect(() => {
    if (meeting && socketConnected) {
      startLocalStream(true, true);
    }
  }, [meeting, socketConnected]); // ✅ Loại bỏ startLocalStream khỏi dependencies
  
  // Set local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);
  
  const handleLeaveMeeting = useCallback(async () => {
    try {
      leaveMeeting();
      cleanupWebRTC();
      
      if (meeting) {
        await apiClient.leaveMeeting(roomId);
      }
      
      message.success('Left meeting successfully');
      onLeave?.();
      router.push('/dashboard/meetings');
    } catch (error) {
      console.error('Error leaving meeting:', error);
      message.error('Failed to leave meeting');
    }
  }, [meeting, roomId, onLeave]); // ✅ Chỉ giữ lại dependencies cần thiết
  
  const handleToggleVideo = useCallback(() => {
    toggleVideo();
  }, []); // ✅ Function stable, không cần dependencies

  const handleToggleAudio = useCallback(() => {
    toggleAudio();
  }, []); // ✅ Function stable, không cần dependencies

  const handleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      await stopScreenShare();
      notifyScreenShareStop();
    } else {
      await startScreenShare();
      notifyScreenShareStart();
    }
  }, [isScreenSharing]); // ✅ Chỉ phụ thuộc vào state
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Text>Meeting not found</Text>
      </div>
    );
  }
  
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#000',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '16px', 
        backgroundColor: 'rgba(0, 0, 0, 0.8)', 
        color: 'white',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10
      }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ color: 'white', margin: 0 }}>
              {meeting.title}
            </Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Room: {meeting.roomId} • {participantsCount} participants
            </Text>
          </Col>
          <Col>
            <Space>
              <Badge 
                status={socketConnected ? 'success' : 'error'} 
                text={socketConnected ? 'Connected' : 'Disconnected'}
                style={{ color: 'white' }}
              />
              <Badge 
                status={connectionState === 'connected' ? 'success' : 'processing'} 
                text={`WebRTC: ${connectionState}`}
                style={{ color: 'white' }}
              />
            </Space>
          </Col>
        </Row>
      </div>

      {/* Video Area */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        padding: '80px 16px 80px 16px',
        position: 'relative'
      }}>
        {/* Video Grid Layout */}
        {participantsCount > 1 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: participantsCount === 2 ? '1fr 1fr' : 
                                participantsCount === 3 ? '1fr 1fr 1fr' :
                                participantsCount === 4 ? '1fr 1fr' :
                                'repeat(auto-fit, minmax(300px, 1fr))',
            gridTemplateRows: participantsCount === 4 ? '1fr 1fr' : '1fr',
            gap: '16px',
            height: '100%',
            width: '100%'
          }}>
            {/* Local Video */}
            <div style={{
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#333',
              border: '2px solid #1890ff'
            }}>
              <VideoPlayer
                stream={localStream}
                muted={true}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              {!isVideoEnabled && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#333'
                }}>
                  <Avatar size={64} icon={<UserOutlined />} />
                  <Text style={{ color: 'white', marginTop: '8px' }}>You</Text>
                </div>
              )}
              <div style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                You {isScreenSharing && '(Sharing)'}
              </div>
            </div>

            {/* Remote Videos */}
            {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
              <div key={userId} style={{
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#333',
                border: '2px solid #52c41a'
              }}>
                <VideoPlayer
                  stream={stream}
                  muted={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  {participants.find(p => p.userId === userId)?.userEmail || 'Participant'}
                </div>
              </div>
            ))}

            {/* Placeholder for additional participants */}
            {participants.slice(remoteStreams.size + 1).map((participant, index) => (
              <div key={participant.userId} style={{
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#333',
                border: '2px solid #faad14',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Avatar size={64} icon={<UserOutlined />} />
                <Text style={{ color: 'white', marginTop: '8px' }}>
                  {participant.userEmail}
                </Text>
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  Connecting...
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Single participant view */
          <>
            {/* Local Video (Full Screen) */}
            <div style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#333'
            }}>
              <VideoPlayer
                stream={localStream}
                muted={true}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              {!isVideoEnabled && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#333'
                }}>
                  <Avatar size={120} icon={<UserOutlined />} />
                  <Text style={{ color: 'white', marginTop: '16px', fontSize: '18px' }}>You</Text>
                </div>
              )}
            </div>

            {/* Waiting message */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: 'white',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              padding: '24px',
              borderRadius: '8px'
            }}>
              <Title level={3} style={{ color: 'white', margin: 0 }}>
                Waiting for others to join...
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Share the room ID: <strong>{meeting.roomId}</strong>
              </Text>
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      <div style={{ 
        padding: '16px', 
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10
      }}>
        <Row justify="center" align="middle">
          <Col>
            <Space size="large">
              <Tooltip title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}>
                <Button
                  type={isVideoEnabled ? 'primary' : 'default'}
                  danger={!isVideoEnabled}
                  shape="circle"
                  size="large"
                  icon={isVideoEnabled ? <VideoCameraOutlined /> : <VideoCameraAddOutlined />}
                  onClick={handleToggleVideo}
                />
              </Tooltip>

              <Tooltip title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}>
                <Button
                  type={isAudioEnabled ? 'primary' : 'default'}
                  danger={!isAudioEnabled}
                  shape="circle"
                  size="large"
                  icon={isAudioEnabled ? <AudioOutlined /> : <AudioMutedOutlined />}
                  onClick={handleToggleAudio}
                />
              </Tooltip>

              <Tooltip title={isScreenSharing ? 'Stop sharing' : 'Share screen'}>
                <Button
                  type={isScreenSharing ? 'primary' : 'default'}
                  shape="circle"
                  size="large"
                  icon={<DesktopOutlined />}
                  onClick={handleScreenShare}
                />
              </Tooltip>

              <Tooltip title="Leave meeting">
                <Button
                  danger
                  shape="circle"
                  size="large"
                  icon={<PhoneOutlined />}
                  onClick={handleLeaveMeeting}
                />
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default MeetingRoom;