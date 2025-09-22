'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Input, 
  Button, 
  List, 
  Avatar, 
  Typography, 
  Space, 
  App,
  Spin,
  Empty,
  Divider
} from 'antd';
import { SendOutlined, UserOutlined } from '@ant-design/icons';
import { apiClient } from '@/lib/api';
import { MeetingMessage } from '@/types/meeting';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TextArea } = Input;

interface MeetingChatProps {
  meetingId: string;
  onSendMessage?: (content: string, type?: string) => void;
}

const MeetingChat: React.FC<MeetingChatProps> = ({ meetingId, onSendMessage }) => {
  const { message } = App.useApp();
  const [messages, setMessages] = useState<MeetingMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load messages
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const messagesData = await apiClient.getMeetingMessages(meetingId, { limit: 100 });
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
      message.error('Failed to load chat messages');
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  // Initial load
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle new message from socket
  const handleNewMessage = useCallback((newMessage: MeetingMessage) => {
    setMessages(prev => {
      // Check if message already exists to avoid duplicates
      const exists = prev.some(msg => msg.id === newMessage.id);
      if (exists) return prev;
      
      return [...prev, newMessage];
    });
  }, []);

  // Send message
  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim()) return;

    try {
      setSending(true);
      
      // Send via API
      const newMessage = await apiClient.sendMeetingMessage(meetingId, {
        content: messageText.trim(),
        type: 'text',
      });

      // Also send via socket for real-time delivery
      onSendMessage?.(messageText.trim(), 'text');

      // Add to local messages immediately for better UX
      setMessages(prev => [...prev, newMessage]);
      setMessageText('');
      
    } catch (error) {
      console.error('Error sending message:', error);
      message.error('Failed to send message');
    } finally {
      setSending(false);
    }
  }, [meetingId, messageText, onSendMessage]);

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return dayjs(timestamp).format('HH:mm');
  };

  const renderMessage = (message: MeetingMessage) => {
    const isSystem = message.type === 'system';
    
    if (isSystem) {
      return (
        <div key={message.id} style={{ textAlign: 'center', margin: '8px 0' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {message.content}
          </Text>
        </div>
      );
    }

    return (
      <List.Item key={message.id} style={{ padding: '8px 0', border: 'none' }}>
        <List.Item.Meta
          avatar={
            <Avatar 
              size="small" 
              icon={<UserOutlined />}
              style={{ backgroundColor: '#1890ff' }}
            >
              {message.sender.displayName?.charAt(0)?.toUpperCase()}
            </Avatar>
          }
          title={
            <Space>
              <Text strong style={{ fontSize: '13px' }}>
                {message.sender.displayName || message.sender.email}
              </Text>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                {formatMessageTime(message.createdAt)}
              </Text>
            </Space>
          }
          description={
            <div style={{ marginTop: '4px' }}>
              <Text style={{ fontSize: '14px', wordBreak: 'break-word' }}>
                {message.content}
              </Text>
              {message.isEdited && (
                <Text type="secondary" style={{ fontSize: '11px', marginLeft: '8px' }}>
                  (edited)
                </Text>
              )}
            </div>
          }
        />
      </List.Item>
    );
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Messages Area */}
      <div 
        ref={chatContainerRef}
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '8px 0',
          maxHeight: 'calc(100vh - 200px)'
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
          </div>
        ) : messages.length === 0 ? (
          <Empty 
            description="No messages yet" 
            style={{ marginTop: '40px' }}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            dataSource={messages}
            renderItem={renderMessage}
            style={{ padding: '0 8px' }}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      <Divider style={{ margin: '8px 0' }} />

      {/* Message Input */}
      <div style={{ padding: '8px' }}>
        <Space.Compact style={{ width: '100%' }}>
          <TextArea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            autoSize={{ minRows: 1, maxRows: 3 }}
            style={{ resize: 'none' }}
            disabled={sending}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            loading={sending}
            disabled={!messageText.trim()}
          />
        </Space.Compact>
      </div>
    </div>
  );
};

export default MeetingChat;
