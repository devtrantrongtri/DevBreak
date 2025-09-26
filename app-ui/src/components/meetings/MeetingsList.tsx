'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  List,
  Button,
  Typography,
  Space,
  Tag,
  Avatar,
  Tooltip,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Switch,
  App,
  Empty,
  Spin,
  Row,
  Col,
  Divider
} from 'antd';
import {
  PlusOutlined,
  VideoCameraOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { apiClient } from '@/lib/api';
import { Meeting, CreateMeetingDto, Project } from '@/types/meeting';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface MeetingsListProps {
  projectId?: string;
  showCreateButton?: boolean;
}

const MeetingsList: React.FC<MeetingsListProps> = ({ 
  projectId, 
  showCreateButton = true 
}) => {
  const router = useRouter();
  const { message } = App.useApp();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Load meetings
  const loadMeetings = useCallback(async () => {
    try {
      setLoading(true);
      let meetingsData: Meeting[];
      
      if (projectId) {
        meetingsData = await apiClient.getMeetingsByProject(projectId);
      } else {
        meetingsData = await apiClient.getMeetings();
      }
      
      setMeetings(meetingsData);
    } catch (error) {
      console.error('Error loading meetings:', error);
      message.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Load projects for create form
  const loadProjects = useCallback(async () => {
    try {
      const projectsData = await apiClient.getAllProjectsForAdmin();
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  }, []);

  useEffect(() => {
    loadMeetings();
    if (!projectId) {
      loadProjects();
    }
  }, [loadMeetings, loadProjects, projectId]);

  // Create meeting
  const handleCreateMeeting = async (values: {
    title: string;
    description?: string;
    scheduledAt: string;
    duration: number;
    type: 'video' | 'audio' | 'screen_share';
  }) => {
    try {
      setCreating(true);
      
      const createData: CreateMeetingDto = {
        title: values.title,
        description: values.description,
        projectId: values.projectId || projectId,
        startTime: values.timeRange?.[0]?.toISOString(),
        endTime: values.timeRange?.[1]?.toISOString(),
        isVideoEnabled: values.isVideoEnabled ?? true,
        isAudioEnabled: values.isAudioEnabled ?? true,
        isChatEnabled: values.isChatEnabled ?? true,
      };

      const newMeeting = await apiClient.createMeeting(createData);
      setMeetings(prev => [newMeeting, ...prev]);
      setCreateModalVisible(false);
      form.resetFields();
      message.success('Meeting created successfully');
      
    } catch (error) {
      console.error('Error creating meeting:', error);
      message.error('Failed to create meeting');
    } finally {
      setCreating(false);
    }
  };

  // Join meeting
  const handleJoinMeeting = async (meeting: Meeting) => {
    try {
      await apiClient.joinMeeting(meeting.roomId, {
        roomId: meeting.roomId,
        isVideoEnabled: true,
        isAudioEnabled: true,
      });
      
      router.push(`/dashboard/meetings/room/${meeting.roomId}`);
    } catch (error) {
      console.error('Error joining meeting:', error);
      message.error('Failed to join meeting');
    }
  };

  // Copy room ID
  const handleCopyRoomId = (roomId: string) => {
    navigator.clipboard.writeText(roomId);
    message.success('Room ID copied to clipboard');
  };

  // Delete meeting
  const handleDeleteMeeting = (meeting: Meeting) => {
    Modal.confirm({
      title: 'Delete Meeting',
      content: `Are you sure you want to delete "${meeting.title}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await apiClient.deleteMeeting(meeting.id);
          setMeetings(prev => prev.filter(m => m.id !== meeting.id));
          message.success('Meeting deleted successfully');
        } catch (error) {
          console.error('Error deleting meeting:', error);
          message.error('Failed to delete meeting');
        }
      },
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'scheduled': return 'processing';
      case 'ended': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not scheduled';
    return dayjs(dateString).format('MMM DD, YYYY HH:mm');
  };

  // Check if meeting can be joined
  const canJoinMeeting = (meeting: Meeting) => {
    return meeting.status === 'scheduled' || meeting.status === 'active';
  };

  const renderMeetingCard = (meeting: Meeting) => (
    <List.Item 
      key={meeting.id} 
      style={{ 
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '12px',
        backgroundColor: '#fafafa',
        border: '1px solid #f0f0f0'
      }}
      actions={[
        canJoinMeeting(meeting) && (
          <Tooltip title="Join Meeting">
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => handleJoinMeeting(meeting)}
              size="small"
            >
              Join
            </Button>
          </Tooltip>
        ),
        <Tooltip key="copy" title="Copy Room ID">
          <Button
            icon={<CopyOutlined />}
            onClick={() => handleCopyRoomId(meeting.roomId)}
            size="small"
          />
        </Tooltip>,
        <Tooltip key="edit" title="Edit Meeting">
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              // TODO: Implement edit functionality
              message.info('Edit functionality not implemented yet');
            }}
            size="small"
          />
        </Tooltip>,
        <Tooltip key="delete" title="Delete Meeting">
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteMeeting(meeting)}
            size="small"
          />
        </Tooltip>,
      ].filter(Boolean)}
    >
      <List.Item.Meta
        avatar={
          <Avatar 
            size={48}
            icon={<VideoCameraOutlined />} 
            style={{ backgroundColor: '#1890ff' }}
          />
        }
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Text 
              strong 
              style={{
                fontSize: '16px',
                maxWidth: '300px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={meeting.title}
            >
              {meeting.title}
            </Text>
            <Tag color={getStatusColor(meeting.status)} style={{ fontSize: '11px' }}>
              {meeting.status.toUpperCase()}
            </Tag>
          </div>
        }
        description={
          <div style={{ maxWidth: '700px' }}>
            {meeting.description && (
              <Text 
                type="secondary" 
                style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  fontSize: '14px',
                  maxWidth: '500px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                title={meeting.description}
              >
                {meeting.description}
              </Text>
            )}
            
            <Space size="middle" wrap>
              <Space size="small">
                <CalendarOutlined style={{ color: '#1890ff' }} />
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  {formatDate(meeting.startTime)}
                </Text>
              </Space>
              
              <Space size="small">
                <UserOutlined style={{ color: '#52c41a' }} />
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  Host: {meeting.host.displayName || meeting.host.email}
                </Text>
              </Space>
              
              <Space size="small">
                <Text type="secondary" style={{ fontSize: '13px' }}>Room:</Text>
                <Text code style={{ fontSize: '12px', padding: '2px 6px' }}>
                  {meeting.roomId}
                </Text>
              </Space>
              
              {meeting.project && (
                <Tag color="blue" style={{ fontSize: '12px' }}>
                  {meeting.project.name}
                </Tag>
              )}
              
              {meeting.participants && meeting.participants.length > 0 && (
                <Tooltip
                  title={
                    <div style={{ maxHeight: '200px', overflowY: 'auto', minWidth: '250px' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>
                        Meeting Participants ({meeting.participants.length})
                      </div>
                      {meeting.participants.map((participant, index) => (
                        <div key={participant.id || index} style={{ marginBottom: '6px', padding: '4px 0' }}>
                          <Space size="small">
                            <Avatar size="small" icon={<UserOutlined />} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '13px', fontWeight: '500' }}>
                                {participant.user?.displayName || participant.user?.email || 'Unknown User'}
                              </div>
                              <Tag 
                                color={participant.role === 'host' ? 'gold' : 'blue'} 
                                style={{ fontSize: '11px', marginTop: '2px' }}
                              >
                                {participant.role}
                              </Tag>
                            </div>
                          </Space>
                        </div>
                      ))}
                    </div>
                  }
                  placement="topLeft"
                  overlayStyle={{ maxWidth: '320px' }}
                >
                  <Tag 
                    icon={<UserOutlined />} 
                    style={{ cursor: 'pointer', fontSize: '12px' }}
                  >
                    {meeting.participants.length} participants
                  </Tag>
                </Tooltip>
              )}
            </Space>
          </div>
        }
      />
    </List.Item>
  );

  return (
    <div>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            {projectId ? 'Project Meetings' : 'Meetings'}
          </Title>
        </Col>
        {showCreateButton && (
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              Create Meeting
            </Button>
          </Col>
        )}
      </Row>

      {/* Meetings List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      ) : meetings.length === 0 ? (
        <Empty
          description="No meetings found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          {showCreateButton && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              Create First Meeting
            </Button>
          )}
        </Empty>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={meetings}
          renderItem={renderMeetingCard}
          pagination={{
            pageSize: 12,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} meetings`,
          }}
        />
      )}

      {/* Create Meeting Modal */}
      <Modal
        title="Create New Meeting"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={creating}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateMeeting}
          initialValues={{
            isVideoEnabled: true,
            isAudioEnabled: true,
            isChatEnabled: true,
          }}
        >
          <Form.Item
            name="title"
            label="Meeting Title"
            rules={[{ required: true, message: 'Please enter meeting title' }]}
          >
            <Input placeholder="Enter meeting title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea
              rows={3}
              placeholder="Enter meeting description (optional)"
            />
          </Form.Item>

          {!projectId && (
            <Form.Item
              name="projectId"
              label="Project (Optional)"
            >
              <Select
                placeholder="Select a project"
                allowClear
                showSearch
                optionFilterProp="children"
              >
                {projects.map(project => (
                  <Option key={project.id} value={project.id}>
                    {project.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="timeRange"
            label="Schedule (Optional)"
          >
            <RangePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              placeholder={['Start time', 'End time']}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Divider />

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="isVideoEnabled"
                label="Video Enabled"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="isAudioEnabled"
                label="Audio Enabled"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="isChatEnabled"
                label="Chat Enabled"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default MeetingsList;
