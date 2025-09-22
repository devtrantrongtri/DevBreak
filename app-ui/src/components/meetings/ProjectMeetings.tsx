'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Button,
  Typography,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Switch,
  App,
  Row,
  Col,
  Divider,
  List,
  Tag,
  Avatar,
  Tooltip,
  Empty
} from 'antd';
import {
  PlusOutlined,
  VideoCameraOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  TeamOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { apiClient } from '@/lib/api';
import { Meeting, CreateMeetingDto, Project, ProjectMember } from '@/types/meeting';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface ProjectMeetingsProps {
  projectId: string;
  projectName?: string;
}

const ProjectMeetings: React.FC<ProjectMeetingsProps> = ({ 
  projectId, 
  projectName 
}) => {
  const router = useRouter();
  const { message } = App.useApp();
  
  // Debug log
  console.log('ProjectMeetings received props:', { projectId, projectName });
  
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Load project meetings
  const loadMeetings = useCallback(async () => {
    if (!projectId || projectId === 'undefined') {
      console.warn('Invalid projectId:', projectId);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const meetingsData = await apiClient.getMeetingsByProject(projectId);
      setMeetings(meetingsData);
    } catch (error) {
      console.error('Error loading project meetings:', error);
      message.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  }, [projectId, message]);

  // Load project members for participant selection
  const loadProjectMembers = useCallback(async () => {
    if (!projectId || projectId === 'undefined') {
      console.warn('Invalid projectId for loading members:', projectId);
      return;
    }
    
    try {
      console.log('Loading project members for project:', projectId);
      const membersData = await apiClient.getProjectMembers(projectId);
      console.log('Project members loaded:', membersData);
      setProjectMembers(membersData);
    } catch (error) {
      console.error('Error loading project members:', error);
      // Fallback with mock data for testing
      const mockMembers = [
        {
          id: '1',
          userId: 'user1',
          projectId: projectId,
          role: 'PM' as const,
          joinedAt: new Date().toISOString(),
          user: {
            id: 'user1',
            email: 'pm@example.com',
            displayName: 'Project Manager',
            isActive: true
          }
        },
        {
          id: '2', 
          userId: 'user2',
          projectId: projectId,
          role: 'DEV' as const,
          joinedAt: new Date().toISOString(),
          user: {
            id: 'user2',
            email: 'dev@example.com',
            displayName: 'Developer',
            isActive: true
          }
        }
      ];
      setProjectMembers(mockMembers);
      message.warning('Using mock data - API may not be available');
    }
  }, [projectId, message]);

  useEffect(() => {
    loadMeetings();
    loadProjectMembers();
  }, [loadMeetings, loadProjectMembers]);

  const handleCreateMeeting = async (values: any) => {
    try {
      setCreating(true);
      
      const createData: CreateMeetingDto = {
        title: values.title,
        description: values.description,
        projectId: projectId, // Luôn thuộc về project này
        scheduledStartTime: values.timeRange[0].toISOString(),
        scheduledEndTime: values.timeRange[1].toISOString(),
        isRecurring: values.isRecurring || false,
        maxParticipants: values.maxParticipants || 10,
        allowRecording: values.allowRecording || false,
        participantIds: values.participantIds || [], // Chọn từ project members
      };

      const newMeeting = await apiClient.createMeeting(createData);
      setMeetings(prev => [newMeeting, ...prev]);
      setCreateModalVisible(false);
      form.resetFields();
      message.success('Meeting created successfully!');
      
      // Trigger refresh of calendar and other meeting lists
      window.dispatchEvent(new CustomEvent('meetingCreated', { detail: newMeeting }));
    } catch (error) {
      console.error('Error creating meeting:', error);
      message.error('Failed to create meeting');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinMeeting = (meeting: Meeting) => {
    const now = dayjs();
    const startTime = dayjs(meeting.startTime || meeting.scheduledStartTime);
    const endTime = dayjs(meeting.endTime || meeting.scheduledEndTime);
    
    if (meeting.status === 'scheduled' && now.isBefore(startTime.subtract(5, 'minute'))) {
      message.warning('Meeting starts in more than 5 minutes');
      return;
    }
    
    if (meeting.status === 'ended' || now.isAfter(endTime)) {
      message.warning('This meeting has ended');
      return;
    }
    
    router.push(`/dashboard/meetings/room/${meeting.roomId}`);
  };
  
  const getMeetingStatus = (meeting: Meeting) => {
    const now = dayjs();
    const startTime = dayjs(meeting.startTime || meeting.scheduledStartTime);
    const endTime = dayjs(meeting.endTime || meeting.scheduledEndTime);
    
    if (now.isBefore(startTime)) {
      return { status: 'scheduled', color: 'blue', text: 'Scheduled' };
    } else if (now.isAfter(endTime)) {
      return { status: 'ended', color: 'default', text: 'Ended' };
    } else {
      return { status: 'active', color: 'green', text: 'Active' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'blue';
      case 'active': return 'green';
      case 'ended': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (meeting: Meeting) => {
    const now = dayjs();
    const start = dayjs(meeting.scheduledStartTime);
    const end = dayjs(meeting.scheduledEndTime);

    if (meeting.status === 'active') return 'Active';
    if (meeting.status === 'ended') return 'Ended';
    if (now.isBefore(start)) return 'Scheduled';
    if (now.isAfter(end)) return 'Missed';
    return 'Ready to Join';
  };

  return (
    <Card 
      title={
        <Space>
          <VideoCameraOutlined />
          <span>Project Meetings</span>
          {projectName && <Text type="secondary">({projectName})</Text>}
        </Space>
      }
      extra={
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          Schedule Meeting
        </Button>
      }
    >
      <List
        loading={loading}
        dataSource={meetings}
        itemLayout="horizontal"
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No meetings scheduled for this project"
            />
          )
        }}
        renderItem={(meeting) => {
          const statusInfo = getMeetingStatus(meeting);
          return (
            <List.Item
              style={{ 
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '8px',
                backgroundColor: '#fafafa',
                border: '1px solid #f0f0f0'
              }}
              actions={[
                <Button
                  key="join"
                  type={statusInfo.status === 'active' ? 'primary' : 'default'}
                  icon={<VideoCameraOutlined />}
                  onClick={() => handleJoinMeeting(meeting)}
                  disabled={statusInfo.status === 'ended'}
                  size="small"
                >
                  {statusInfo.status === 'active' ? 'Join Now' : 'Join'}
                </Button>
              ]}
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
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={meeting.title}
                    >
                      {meeting.title}
                    </Text>
                    <Tag color={statusInfo.color} style={{ fontSize: '11px' }}>
                      {statusInfo.text}
                    </Tag>
                  </div>
                }
                description={
                  <div style={{ maxWidth: '600px' }}>
                    {meeting.description && (
                      <Text 
                        type="secondary" 
                        style={{ 
                          display: 'block', 
                          marginBottom: '8px',
                          fontSize: '14px',
                          maxWidth: '400px',
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
                        <ClockCircleOutlined style={{ color: '#1890ff' }} />
                        <Text type="secondary" style={{ fontSize: '13px' }}>
                          {dayjs(meeting.startTime || meeting.scheduledStartTime).format('MMM DD, HH:mm')}
                          {(meeting.endTime || meeting.scheduledEndTime) && ` - ${dayjs(meeting.endTime || meeting.scheduledEndTime).format('HH:mm')}`}
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
        }}
      />

      {/* Create Meeting Modal */}
      <Modal
        title="Schedule New Meeting"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateMeeting}
          initialValues={{
            maxParticipants: 10,
            allowRecording: false,
            isRecurring: false,
          }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="title"
                label="Meeting Title"
                rules={[{ required: true, message: 'Please enter meeting title' }]}
              >
                <Input placeholder="Enter meeting title" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Description"
              >
                <TextArea 
                  rows={3} 
                  placeholder="Meeting description (optional)" 
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="timeRange"
                label="Meeting Time"
                rules={[{ required: true, message: 'Please select meeting time' }]}
              >
                <RangePicker
                  showTime={{ format: 'HH:mm' }}
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="maxParticipants"
                label="Max Participants"
              >
                <Select>
                  <Option value={5}>5 participants</Option>
                  <Option value={10}>10 participants</Option>
                  <Option value={25}>25 participants</Option>
                  <Option value={50}>50 participants</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="participantIds"
                label="Invite Participants"
              >
                <Select
                  mode="multiple"
                  placeholder={projectMembers.length > 0 ? "Select project members" : "Loading members..."}
                  optionFilterProp="children"
                  loading={projectMembers.length === 0}
                  notFoundContent={projectMembers.length === 0 ? "Loading..." : "No members found"}
                >
                  {projectMembers.map(member => {
                    console.log('Rendering member:', member);
                    return (
                      <Option key={member.userId || member.id} value={member.userId || member.id}>
                        <Space>
                          <Avatar size="small" icon={<UserOutlined />} />
                          {member.user?.displayName || member.user?.email || 'Unknown User'}
                        </Space>
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="allowRecording"
                valuePropName="checked"
              >
                <Switch /> Allow Recording
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isRecurring"
                valuePropName="checked"
              >
                <Switch /> Recurring Meeting
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Row justify="end">
            <Space>
              <Button onClick={() => {
                setCreateModalVisible(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={creating}
                icon={<PlusOutlined />}
              >
                Schedule Meeting
              </Button>
            </Space>
          </Row>
        </Form>
      </Modal>
    </Card>
  );
};

export default ProjectMeetings;
