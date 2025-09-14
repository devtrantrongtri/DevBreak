'use client';

import React, { useState } from 'react';
import {
  Modal,
  Upload,
  Button,
  message,
  Steps,
  Table,
  Alert,
  Typography,
  Space,
  Progress,
  Tag,
} from 'antd';
import {
  UploadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { apiClient } from '@/lib/api';

const { Step } = Steps;
const { Text, Title } = Typography;
const { Dragger } = Upload;

interface UserImportModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ImportUser {
  email: string;
  displayName: string;
  isActive: boolean;
  groups: string[];
  status?: 'pending' | 'success' | 'error';
  error?: string;
}

const UserImportModal: React.FC<UserImportModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [importData, setImportData] = useState<ImportUser[]>([]);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: number;
    total: number;
  }>({ success: 0, errors: 0, total: 0 });
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const users: ImportUser[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length >= 2 && values[0] && values[1]) {
            users.push({
              email: values[0],
              displayName: values[1],
              isActive: values[2]?.toLowerCase() !== 'false',
              groups: values[3] ? values[3].split(';').map(g => g.trim()) : [],
              status: 'pending',
            });
          }
        }
        
        setImportData(users);
        setCurrentStep(1);
        message.success(`Parsed ${users.length} users from CSV`);
      } catch (error) {
        message.error('Failed to parse CSV file');
        console.error('CSV parsing error:', error);
      }
    };
    reader.readAsText(file);
    return false; // Prevent default upload
  };

  const downloadTemplate = () => {
    const template = [
      'email,displayName,isActive,groups',
      'john.doe@example.com,John Doe,true,Regular Users',
      'jane.smith@example.com,Jane Smith,true,Administrators;Regular Users',
      'inactive.user@example.com,Inactive User,false,Regular Users',
    ].join('\n');
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user-import-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    try {
      setImporting(true);
      setCurrentStep(2);
      
      const results = [...importData];
      
      for (let i = 0; i < results.length; i++) {
        try {
          const user = results[i];
          await apiClient.createUser({
            email: user.email,
            displayName: user.displayName,
            password: 'TempPassword123!', // Default password
            isActive: user.isActive,
          });
          
          results[i].status = 'success';
          setImportProgress(((i + 1) / results.length) * 100);
          setImportData([...results]);
          
          // Small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error: any) {
          results[i].status = 'error';
          results[i].error = error?.response?.data?.message || 'Failed to create user';
          setImportData([...results]);
        }
      }
      
      const successCount = results.filter(u => u.status === 'success').length;
      const errorCount = results.filter(u => u.status === 'error').length;
      
      if (successCount > 0) {
        message.success(`Successfully imported ${successCount} users`);
      }
      if (errorCount > 0) {
        message.warning(`${errorCount} users failed to import`);
      }
      
      if (successCount > 0) {
        onSuccess();
      }
    } catch (error) {
      message.error('Import process failed');
      console.error('Import error:', error);
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setImportData([]);
    setImportProgress(0);
    onClose();
  };

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Display Name',
      dataIndex: 'displayName',
      key: 'displayName',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Groups',
      dataIndex: 'groups',
      key: 'groups',
      render: (groups: string[]) => (
        <Space wrap>
          {groups.map(group => (
            <Tag key={group}>{group}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Import Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: ImportUser) => {
        if (status === 'success') {
          return <Tag color="green" icon={<CheckCircleOutlined />}>Success</Tag>;
        }
        if (status === 'error') {
          return (
            <Tag color="red" icon={<ExclamationCircleOutlined />}>
              Error: {record.error}
            </Tag>
          );
        }
        return <Tag>Pending</Tag>;
      },
    },
  ];

  return (
    <Modal
      title="Import Users"
      open={visible}
      onCancel={handleClose}
      width={800}
      footer={null}
    >
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        <Step title="Upload File" description="Select CSV file to import" />
        <Step title="Review Data" description="Verify user information" />
        <Step title="Import" description="Process and create users" />
      </Steps>

      {currentStep === 0 && (
        <div>
          <Alert
            message="CSV Format Requirements"
            description="Your CSV file should have columns: email, displayName, isActive, groups (semicolon-separated)"
            type="info"
            style={{ marginBottom: 16 }}
            action={
              <Button size="small" icon={<DownloadOutlined />} onClick={downloadTemplate}>
                Download Template
              </Button>
            }
          />
          
          <Dragger
            accept=".csv"
            beforeUpload={handleFileUpload}
            showUploadList={false}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">Click or drag CSV file to this area to upload</p>
            <p className="ant-upload-hint">
              Support for single CSV file upload. File should contain user data in the specified format.
            </p>
          </Dragger>
        </div>
      )}

      {currentStep === 1 && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Title level={4}>Review Import Data ({importData.length} users)</Title>
            <Text type="secondary">
              Please review the user data below before proceeding with the import.
            </Text>
          </div>
          
          <Table
            columns={columns}
            dataSource={importData}
            rowKey="email"
            size="small"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 600 }}
          />
          
          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setCurrentStep(0)}>
                Back
              </Button>
              <Button type="primary" onClick={handleImport}>
                Start Import
              </Button>
            </Space>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Title level={4}>Importing Users...</Title>
            <Progress percent={Math.round(importProgress)} status="active" />
          </div>
          
          <Table
            columns={columns}
            dataSource={importData}
            rowKey="email"
            size="small"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 600 }}
          />
          
          {!importing && (
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Button type="primary" onClick={handleClose}>
                Close
              </Button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default UserImportModal;
