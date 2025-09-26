'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input, Typography, Button, Space, message } from 'antd';
import type { InputRef } from 'antd';
import { EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface EditablePermissionNameProps {
  value: string;
  code: string;
  onSave: (newName: string) => Promise<void>;
  disabled?: boolean;
  style?: React.CSSProperties;
}

const EditablePermissionName: React.FC<EditablePermissionNameProps> = ({
  value,
  code,
  onSave,
  disabled = false,
  style
}) => {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [loading, setSaving] = useState(false);
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleEdit = () => {
    if (disabled) return;
    setEditing(true);
    setInputValue(value);
  };

  const handleSave = async () => {
    if (inputValue.trim() === '') {
      message.error('Tên quyền không được để trống');
      return;
    }

    if (inputValue === value) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      await onSave(inputValue.trim());
      setEditing(false);
      message.success('Cập nhật tên quyền thành công');
    } catch (error) {
      message.error('Cập nhật tên quyền thất bại');
      setInputValue(value); // Reset to original value
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setInputValue(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, ...style }}>
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          size="small"
          style={{ 
            fontSize: '13px',
            minWidth: '150px',
            maxWidth: '300px'
          }}
          disabled={loading}
        />
        <Space size={2}>
          <Button
            type="text"
            size="small"
            icon={<CheckOutlined />}
            onClick={handleSave}
            loading={loading}
            style={{ 
              color: '#52c41a',
              padding: '2px 4px',
              minWidth: 'auto',
              height: '20px'
            }}
          />
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={handleCancel}
            disabled={loading}
            style={{ 
              color: '#ff4d4f',
              padding: '2px 4px',
              minWidth: 'auto',
              height: '20px'
            }}
          />
        </Space>
      </div>
    );
  }

  return (
    <div 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 4,
        cursor: disabled ? 'default' : 'pointer',
        ...style 
      }}
      onClick={handleEdit}
    >
      <Text 
        strong 
        style={{ 
          fontSize: '13px',
          color: disabled ? '#d9d9d9' : undefined
        }}
      >
        {value}
      </Text>
      {!disabled && (
        <EditOutlined 
          style={{ 
            fontSize: '11px', 
            color: '#8c8c8c',
            opacity: 0.6,
            transition: 'opacity 0.2s'
          }}
          className="edit-icon"
        />
      )}
      <style jsx>{`
        .edit-icon:hover {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};

export default EditablePermissionName;
