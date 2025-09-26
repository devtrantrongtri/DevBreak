'use client';

import React, { useState } from 'react';
import { 
  List, 
  Avatar, 
  Typography, 
  Space, 
  Badge, 
  Button, 
  Dropdown, 
  Modal, 
  App,
  Tag
} from 'antd';
import { 
  UserOutlined, 
  VideoCameraOutlined, 
  AudioOutlined, 
  DesktopOutlined,
  MoreOutlined,
  CrownOutlined,
  AudioMutedOutlined,
  VideoCameraAddOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Meeting, MeetingParticipant, SocketParticipant } from '@/types/meeting';
import { apiClient } from '@/lib/api';

const { Text } = Typography;

interface ParticipantsListProps {
  meeting: Meeting;
  participants: SocketParticipant[];
  currentUserId?: string;
  onParticipantUpdate?: (participantId: string, updates: {
    isMuted?: boolean;
    isCameraOn?: boolean;
    isScreenSharing?: boolean;
  }) => void;
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({ 
  meeting, 
  participants,
  currentUserId,
  onParticipantUpdate 
}) => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState<string | null>(null);

  // Get participant details from meeting data
  const getParticipantDetails = (socketParticipant: SocketParticipant): MeetingParticipant | null => {
    return meeting.participants.find(p => p.userId === socketParticipant.userId) || null;
  };

  // Check if current user is host or co-host
  const canManageParticipants = (participant: MeetingParticipant | null) => {
    if (!participant || !currentUserId) return false;
    const currentUserParticipant = meeting.participants.find(p => p.userId === currentUserId);
    return currentUserParticipant?.role === 'host' || currentUserParticipant?.role === 'co-host';
  };

  // Handle participant actions
  const handleParticipantAction = async (
    participantId: string,
    action: string,
    value?: boolean
  ) => {
    try {
      setLoading(participantId);

      const updates: {
        isMuted?: boolean;
        isCameraOn?: boolean;
        isScreenSharing?: boolean;
      } = {};
      
      switch (action) {
        case 'mute':
          updates.isMuted = true;
          updates.canSpeak = false;
          break;
        case 'unmute':
          updates.isMuted = false;
          updates.canSpeak = true;
          break;
        case 'disable_video':
          updates.isVideoEnabled = false;
          break;
        case 'enable_video':
          updates.isVideoEnabled = true;
          break;
        case 'make_cohost':
          updates.role = 'co-host';
          break;
        case 'make_participant':
          updates.role = 'participant';
          break;
        case 'remove':
          // This would require a different API endpoint
          Modal.confirm({
            title: 'Remove Participant',
            content: 'Are you sure you want to remove this participant from the meeting?',
            onOk: async () => {
              // Implementation for removing participant
              message.info('Remove participant functionality not implemented yet');
            },
          });
          return;
      }

      await apiClient.updateParticipant(meeting.id, participantId, updates);
      onParticipantUpdate?.(participantId, updates);
      message.success('Participant updated successfully');
      
    } catch (error) {
      console.error('Error updating participant:', error);
      message.error('Failed to update participant');
    } finally {
      setLoading(null);
    }
  };

  const getParticipantMenuItems = (
    socketParticipant: SocketParticipant,
    participant: MeetingParticipant | null
  ): MenuProps['items'] => {
    if (!participant || !canManageParticipants(participant)) {
      return [];
    }

    const items: MenuProps['items'] = [];

    // Audio controls
    if (participant.isMuted) {
      items.push({
        key: 'unmute',
        label: 'Unmute',
        icon: <AudioOutlined />,
        onClick: () => handleParticipantAction(participant.id, 'unmute'),
      });
    } else {
      items.push({
        key: 'mute',
        label: 'Mute',
        icon: <AudioMutedOutlined />,
        onClick: () => handleParticipantAction(participant.id, 'mute'),
      });
    }

    // Video controls
    if (participant.isVideoEnabled) {
      items.push({
        key: 'disable_video',
        label: 'Disable Video',
        icon: <VideoCameraAddOutlined />,
        onClick: () => handleParticipantAction(participant.id, 'disable_video'),
      });
    } else {
      items.push({
        key: 'enable_video',
        label: 'Enable Video',
        icon: <VideoCameraOutlined />,
        onClick: () => handleParticipantAction(participant.id, 'enable_video'),
      });
    }

    // Role management
    if (participant.role === 'participant') {
      items.push({
        key: 'make_cohost',
        label: 'Make Co-host',
        icon: <CrownOutlined />,
        onClick: () => handleParticipantAction(participant.id, 'make_cohost'),
      });
    } else if (participant.role === 'co-host') {
      items.push({
        key: 'make_participant',
        label: 'Make Participant',
        icon: <UserOutlined />,
        onClick: () => handleParticipantAction(participant.id, 'make_participant'),
      });
    }

    // Remove participant (only for host)
    const currentUserParticipant = meeting.participants.find(p => p.userId === currentUserId);
    if (currentUserParticipant?.role === 'host' && participant.role !== 'host') {
      items.push({
        type: 'divider',
      });
      items.push({
        key: 'remove',
        label: 'Remove from Meeting',
        danger: true,
        onClick: () => handleParticipantAction(participant.id, 'remove'),
      });
    }

    return items;
  };

  const renderParticipant = (socketParticipant: SocketParticipant) => {
    const participant = getParticipantDetails(socketParticipant);
    const isCurrentUser = socketParticipant.userId === currentUserId;
    const menuItems = getParticipantMenuItems(socketParticipant, participant);

    return (
      <List.Item
        key={socketParticipant.userId}
        style={{ padding: '12px 16px' }}
        actions={[
          menuItems && menuItems.length > 0 && (
            <Dropdown
              menu={{ items: menuItems }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button
                type="text"
                icon={<MoreOutlined />}
                size="small"
                loading={loading === participant?.id}
              />
            </Dropdown>
          )
        ].filter(Boolean)}
      >
        <List.Item.Meta
          avatar={
            <Badge 
              dot 
              status="success" 
              offset={[-8, 8]}
            >
              <Avatar 
                icon={<UserOutlined />}
                style={{ backgroundColor: '#1890ff' }}
              >
                {socketParticipant.userEmail.charAt(0).toUpperCase()}
              </Avatar>
            </Badge>
          }
          title={
            <Space>
              <Text strong>
                {socketParticipant.userEmail}
                {isCurrentUser && <Text type="secondary"> (You)</Text>}
              </Text>
              {participant?.role === 'host' && (
                <Tag color="gold" icon={<CrownOutlined />}>
                  Host
                </Tag>
              )}
              {participant?.role === 'co-host' && (
                <Tag color="blue" icon={<CrownOutlined />}>
                  Co-host
                </Tag>
              )}
            </Space>
          }
          description={
            <Space size="small">
              {/* Audio status */}
              {participant?.isAudioEnabled ? (
                participant?.isMuted ? (
                  <AudioMutedOutlined style={{ color: '#ff4d4f' }} />
                ) : (
                  <AudioOutlined style={{ color: '#52c41a' }} />
                )
              ) : (
                <AudioMutedOutlined style={{ color: '#d9d9d9' }} />
              )}

              {/* Video status */}
              {participant?.isVideoEnabled ? (
                <VideoCameraOutlined style={{ color: '#52c41a' }} />
              ) : (
                <VideoCameraAddOutlined style={{ color: '#d9d9d9' }} />
              )}

              {/* Screen sharing status */}
              {participant?.isScreenSharing && (
                <DesktopOutlined style={{ color: '#1890ff' }} />
              )}

              {/* Connection status */}
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {participant?.status === 'joined' ? 'Connected' : participant?.status || 'Unknown'}
              </Text>
            </Space>
          }
        />
      </List.Item>
    );
  };

  return (
    <div>
      <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
        <Text strong>
          Participants ({participants.length})
        </Text>
      </div>
      
      <List
        dataSource={participants}
        renderItem={renderParticipant}
        style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
      />
    </div>
  );
};

export default ParticipantsList;
