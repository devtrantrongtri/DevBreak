'use client';

import React, { Component, ReactNode } from 'react';
import { Result, Button } from 'antd';
import { BugOutlined, ReloadOutlined } from '@ant-design/icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ padding: '50px 20px', textAlign: 'center' }}>
          <Result
            status="error"
            icon={<BugOutlined style={{ color: '#ff4d4f' }} />}
            title="Đã xảy ra lỗi"
            subTitle="Ứng dụng gặp lỗi không mong muốn. Vui lòng thử lại hoặc liên hệ quản trị viên."
            extra={[
              <Button key="retry" type="primary" onClick={this.handleReset}>
                Thử lại
              </Button>,
              <Button key="reload" icon={<ReloadOutlined />} onClick={this.handleReload}>
                Tải lại trang
              </Button>,
            ]}
          >
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div style={{ 
                background: '#f5f5f5',
                padding: '16px',
                borderRadius: '4px',
                textAlign: 'left',
                marginTop: '16px',
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#666',
                maxHeight: '200px',
                overflow: 'auto'
              }}>
                <strong>Chi tiết lỗi (chỉ hiển thị trong môi trường phát triển):</strong>
                <pre>{this.state.error.stack}</pre>
              </div>
            )}
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
