'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Button, Space, Tooltip, Divider, Modal, Tag, Typography, Avatar, Spin } from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  LinkOutlined,
  CodeOutlined,
  TagOutlined,
  UserOutlined,
  ClockCircleOutlined,
  FlagOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import TaskMentionAutocomplete from './TaskMentionAutocomplete';
import { Task, TASK_STATUSES, TASK_PRIORITIES } from '@/types/collab';
import { apiClient } from '@/lib/api';
import './RichTextEditor.scss';

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  disabled?: boolean;
  showToolbar?: boolean;
  enableTaskMentions?: boolean;
  onTaskMention?: (taskId: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = '',
  onChange,
  placeholder = 'Nhập nội dung...',
  minHeight = 120,
  maxHeight = 300,
  disabled = false,
  showToolbar = true,
  enableTaskMentions = true,
  onTaskMention
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteQuery, setAutocompleteQuery] = useState('');
  const [autocompletePosition, setAutocompletePosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
      // Setup task mention hover handlers
      setupTaskMentionHandlers();
    }
  }, [value]);

  const setupTaskMentionHandlers = () => {
    if (!editorRef.current) return;

    const taskMentions = editorRef.current.querySelectorAll('.task-mention');
    taskMentions.forEach((mention) => {
      const taskId = mention.getAttribute('data-task-id');
      if (taskId) {
        // Remove existing handlers
        mention.removeEventListener('mouseenter', handleMentionHover);
        mention.removeEventListener('mouseleave', handleMentionLeave);
        mention.removeEventListener('click', handleMentionClick);

        // Add new handlers
        mention.addEventListener('mouseenter', handleMentionHover);
        mention.addEventListener('mouseleave', handleMentionLeave);
        mention.addEventListener('click', handleMentionClick);
      }
    });
  };

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [taskDetails, setTaskDetails] = useState<Task | null>(null);
  const [loadingTask, setLoadingTask] = useState(false);

  const handleMentionHover = (e: Event) => {
    const target = e.target as HTMLElement;
    const taskId = target.getAttribute('data-task-id');
    if (taskId) {
      target.style.backgroundColor = '#e6f4ff';
      target.style.cursor = 'pointer';
      target.title = 'Click để xem chi tiết task';
    }
  };

  const handleMentionLeave = (e: Event) => {
    const target = e.target as HTMLElement;
    target.style.backgroundColor = '';
    target.style.cursor = '';
    target.title = '';
  };

  const handleMentionClick = async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.target as HTMLElement;
    const taskId = target.getAttribute('data-task-id');
    if (taskId) {
      setSelectedTaskId(taskId);
      setTaskModalVisible(true);
      await loadTaskDetails(taskId);
    }
  };

  const loadTaskDetails = async (taskId: string) => {
    try {
      setLoadingTask(true);
      const task = await apiClient.request<Task>(`/collab/tasks/${taskId}`);
      setTaskDetails(task);
    } catch (error) {
      console.error('Failed to load task details:', error);
      setTaskDetails(null);
    } finally {
      setLoadingTask(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      todo: '#d9d9d9',
      in_process: '#1890ff',
      ready_for_qc: '#faad14',
      done: '#52c41a'
    };
    return colors[status as keyof typeof colors] || '#d9d9d9';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: '#52c41a',
      medium: '#faad14',
      high: '#ff7a45',
      critical: '#ff4d4f'
    };
    return colors[priority as keyof typeof colors] || '#faad14';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      todo: <ExclamationCircleOutlined style={{ color: '#d9d9d9' }} />,
      in_process: <SyncOutlined spin style={{ color: '#1890ff' }} />,
      ready_for_qc: <ClockCircleOutlined style={{ color: '#faad14' }} />,
      done: <CheckCircleOutlined style={{ color: '#52c41a' }} />
    };
    return icons[status as keyof typeof icons] || <ExclamationCircleOutlined style={{ color: '#d9d9d9' }} />;
  };

  const formatDueDate = (dueDate: string | Date | null) => {
    if (!dueDate) return 'Không có deadline';
    const date = new Date(dueDate);
    return date.toLocaleDateString('vi-VN');
  };

  const handleInput = () => {
    if (editorRef.current && onChange) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle @ mentions for tasks
    if (enableTaskMentions && e.key === '@') {
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          // Calculate position relative to editor container
          const editorRect = editorRef.current?.getBoundingClientRect();
          if (editorRect) {
            setAutocompletePosition({
              top: rect.bottom - editorRect.top + 5,
              left: rect.left - editorRect.left
            });
          }
          setShowAutocomplete(true);
          setAutocompleteQuery('');
        }
      }, 0);
    }

    // Handle typing after @
    if (showAutocomplete && e.key.length === 1) {
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const textNode = range.startContainer;
          if (textNode.nodeType === Node.TEXT_NODE) {
            const text = textNode.textContent || '';
            const atIndex = text.lastIndexOf('@');
            if (atIndex !== -1) {
              const query = text.substring(atIndex + 1);
              setAutocompleteQuery(query);
            }
          }
        }
      }, 0);
    }

    // Handle Enter key for line breaks
    if (e.key === 'Enter' && !e.shiftKey && !showAutocomplete) {
      e.preventDefault();
      document.execCommand('insertHTML', false, '<br><br>');
    }

    // Close autocomplete on Escape or Space
    if (showAutocomplete && (e.key === 'Escape' || e.key === ' ')) {
      setShowAutocomplete(false);
    }
  };

  const execCommand = (command: string, value?: string) => {
    if (disabled) return;
    
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    handleInput();
  };

  const insertTaskMention = (taskId: string) => {
    if (disabled) return;
    
    const mention = `<span class="task-mention" data-task-id="${taskId}">@${taskId}</span>&nbsp;`;
    document.execCommand('insertHTML', false, mention);
    handleInput();
  };

  const insertLink = () => {
    const url = prompt('Nhập URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const formatList = (type: 'ordered' | 'unordered') => {
    const command = type === 'ordered' ? 'insertOrderedList' : 'insertUnorderedList';
    execCommand(command);
  };

  const handleTaskSelect = (task: Task) => {
    // Replace the @query with the task mention
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const textNode = range.startContainer;

      if (textNode.nodeType === Node.TEXT_NODE) {
        const text = textNode.textContent || '';
        const atIndex = text.lastIndexOf('@');

        if (atIndex !== -1) {
          // Remove the @query text
          const beforeAt = text.substring(0, atIndex);
          const afterQuery = text.substring(range.startOffset);

          // Create new text node with the part before @
          if (beforeAt) {
            textNode.textContent = beforeAt;
          } else {
            textNode.textContent = '';
          }

          // Insert task mention - use task.code or task.title as fallback
          const taskIdentifier = task.code || task.title || `TASK-${task.id.substring(0, 8)}`;
          const mention = `<span class="task-mention" data-task-id="${task.id}">@${taskIdentifier}</span>&nbsp;`;
          document.execCommand('insertHTML', false, mention + afterQuery);
        }
      }
    }

    setShowAutocomplete(false);
    setAutocompleteQuery('');
    handleInput();
  };

  return (
    <div
      className={`rich-text-editor ${disabled ? 'disabled' : ''} ${isFocused ? 'focused' : ''}`}
      style={{ position: 'relative' }}
    >
      {showToolbar && (
        <div className="editor-toolbar">
          <Space size="small">
            <Tooltip title="Bold (Ctrl+B)">
              <Button
                type="text"
                size="small"
                icon={<BoldOutlined />}
                onClick={() => execCommand('bold')}
                disabled={disabled}
              />
            </Tooltip>
            
            <Tooltip title="Italic (Ctrl+I)">
              <Button
                type="text"
                size="small"
                icon={<ItalicOutlined />}
                onClick={() => execCommand('italic')}
                disabled={disabled}
              />
            </Tooltip>
            
            <Tooltip title="Underline (Ctrl+U)">
              <Button
                type="text"
                size="small"
                icon={<UnderlineOutlined />}
                onClick={() => execCommand('underline')}
                disabled={disabled}
              />
            </Tooltip>

            <Divider type="vertical" style={{ margin: '0 4px' }} />

            <Tooltip title="Bullet List">
              <Button
                type="text"
                size="small"
                icon={<UnorderedListOutlined />}
                onClick={() => formatList('unordered')}
                disabled={disabled}
              />
            </Tooltip>
            
            <Tooltip title="Numbered List">
              <Button
                type="text"
                size="small"
                icon={<OrderedListOutlined />}
                onClick={() => formatList('ordered')}
                disabled={disabled}
              />
            </Tooltip>

            <Divider type="vertical" style={{ margin: '0 4px' }} />

            <Tooltip title="Insert Link">
              <Button
                type="text"
                size="small"
                icon={<LinkOutlined />}
                onClick={insertLink}
                disabled={disabled}
              />
            </Tooltip>
            
            <Tooltip title="Code">
              <Button
                type="text"
                size="small"
                icon={<CodeOutlined />}
                onClick={() => execCommand('formatBlock', 'pre')}
                disabled={disabled}
              />
            </Tooltip>

            {enableTaskMentions && (
              <>
                <Divider type="vertical" style={{ margin: '0 4px' }} />
                <Tooltip title="Mention Task (@TASK-001)">
                  <Button
                    type="text"
                    size="small"
                    icon={<TagOutlined />}
                    onClick={() => insertTaskMention('TASK-')}
                    disabled={disabled}
                  />
                </Tooltip>
              </>
            )}
          </Space>
        </div>
      )}

      <div
        ref={editorRef}
        className="editor-content"
        contentEditable={!disabled}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          minHeight: `${minHeight}px`,
          maxHeight: `${maxHeight}px`,
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      {/* Task Mention Autocomplete */}
      <TaskMentionAutocomplete
        query={autocompleteQuery}
        onSelect={handleTaskSelect}
        onClose={() => setShowAutocomplete(false)}
        visible={showAutocomplete}
        position={autocompletePosition}
      />

      {/* Task Detail Modal for clicked mentions */}
      <Modal
        title={
          taskDetails ? (
            <Space>
              <Tag color="blue">{taskDetails.code || 'N/A'}</Tag>
              <Typography.Text strong>{taskDetails.title}</Typography.Text>
            </Space>
          ) : 'Chi tiết Task'
        }
        open={taskModalVisible}
        onCancel={() => {
          setTaskModalVisible(false);
          setTaskDetails(null);
          setSelectedTaskId(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setTaskModalVisible(false);
            setTaskDetails(null);
            setSelectedTaskId(null);
          }}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {loadingTask ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
            <Typography.Text style={{ display: 'block', marginTop: '16px' }}>
              Đang tải thông tin task...
            </Typography.Text>
          </div>
        ) : taskDetails ? (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space size="middle">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getStatusIcon(taskDetails.status)}
                  <Tag color={getStatusColor(taskDetails.status)}>
                    {TASK_STATUSES[taskDetails.status as keyof typeof TASK_STATUSES] || taskDetails.status}
                  </Tag>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FlagOutlined style={{ color: getPriorityColor(taskDetails.priority) }} />
                  <Tag color={getPriorityColor(taskDetails.priority)}>
                    {TASK_PRIORITIES[taskDetails.priority as keyof typeof TASK_PRIORITIES] || taskDetails.priority}
                  </Tag>
                </div>
              </Space>
            </div>

            {taskDetails.description && (
              <div>
                <Typography.Text strong>Mô tả:</Typography.Text>
                <Typography.Paragraph style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>
                  {taskDetails.description}
                </Typography.Paragraph>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {taskDetails.assignee && (
                <div>
                  <Typography.Text strong>Người thực hiện:</Typography.Text>
                  <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar size="small" icon={<UserOutlined />} />
                    <Typography.Text>{taskDetails.assignee.displayName}</Typography.Text>
                  </div>
                </div>
              )}

              {taskDetails.dueDate && (
                <div>
                  <Typography.Text strong>Deadline:</Typography.Text>
                  <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ClockCircleOutlined />
                    <Typography.Text>{formatDueDate(taskDetails.dueDate)}</Typography.Text>
                  </div>
                </div>
              )}
            </div>

            {taskDetails.estimatedHours && (
              <div>
                <Typography.Text strong>Thời gian ước tính:</Typography.Text>
                <Typography.Text style={{ marginLeft: '8px' }}>{taskDetails.estimatedHours} giờ</Typography.Text>
              </div>
            )}

            {taskDetails.actualHours && parseFloat(taskDetails.actualHours) > 0 && (
              <div>
                <Typography.Text strong>Thời gian thực tế:</Typography.Text>
                <Typography.Text style={{ marginLeft: '8px' }}>{taskDetails.actualHours} giờ</Typography.Text>
              </div>
            )}
          </Space>
        ) : (
          <Typography.Text type="secondary">Không thể tải thông tin task</Typography.Text>
        )}
      </Modal>
    </div>
  );
};

export default RichTextEditor;
