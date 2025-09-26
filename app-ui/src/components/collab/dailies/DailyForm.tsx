'use client';

import React, { useState, useEffect } from 'react';
import { Form, Button, notification, Alert } from 'antd';
import { SaveOutlined, CalendarOutlined } from '@ant-design/icons';
import { useProject } from '@/contexts/ProjectContext';
import { CreateDailyDto, UpdateDailyDto, Daily } from '@/types/collab';
import { apiClient } from '@/lib/api';
import RichTextEditor from '../common/RichTextEditor';
import dayjs from 'dayjs';

interface DailyFormProps {
  selectedDate?: string;
  onSuccess?: (daily: Daily) => void;
}

const DailyForm: React.FC<DailyFormProps> = ({ 
  selectedDate,
  onSuccess 
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [existingDaily, setExistingDaily] = useState<Daily | null>(null);
  const { currentProject, userRole } = useProject();

  const reportDate = selectedDate || dayjs().format('YYYY-MM-DD');

  // Load existing daily for the selected date
  useEffect(() => {
    if (currentProject) {
      loadExistingDaily();
    }
  }, [currentProject, reportDate]);

  const loadExistingDaily = async () => {
    if (!currentProject) return;

    try {
      const response = await apiClient.request<Daily[]>(
        `/collab/dailies/my?date=${reportDate}`
      );
      
      const daily = response.find(d => d.projectId === currentProject.id);
      if (daily) {
        setExistingDaily(daily);
        form.setFieldsValue({
          yesterday: daily.yesterday,
          today: daily.today,
          blockers: daily.blockers,
        });
      } else {
        setExistingDaily(null);
        form.resetFields();
      }
    } catch (error) {
      console.error('Failed to load existing daily:', error);
    }
  };

  const handleSubmit = async (values: {
    yesterday: string;
    today: string;
    blockers: string;
    reportDate: string;
  }) => {
    if (!currentProject) {
      notification.error({
        message: 'Lỗi',
        description: 'Vui lòng chọn dự án'
      });
      return;
    }

    try {
      setLoading(true);

      if (existingDaily) {
        // Update existing daily
        const updateDto: UpdateDailyDto = {
          yesterday: values.yesterday,
          today: values.today,
          blockers: values.blockers,
        };

        console.log('Updating daily with data:', updateDto);

        const response = await apiClient.request<Daily>(
          `/collab/dailies/${existingDaily.id}`,
          {
            method: 'PATCH',
            data: updateDto,
          }
        );

        notification.success({
          message: 'Thành công',
          description: 'Cập nhật daily thành công'
        });
        setExistingDaily(response);
        onSuccess?.(response);
      } else {
        // Create new daily
        const createDto: CreateDailyDto = {
          projectId: currentProject.id,
          reportDate: reportDate,
          yesterday: values.yesterday,
          today: values.today,
          blockers: values.blockers || '',
        };

        console.log('Sending daily data:', createDto);

        const response = await apiClient.request<Daily>(
          '/collab/dailies',
          {
            method: 'POST',
            data: createDto,
          }
        );

        notification.success({
          message: 'Thành công',
          description: 'Tạo daily thành công'
        });
        setExistingDaily(response);
        onSuccess?.(response);
      }
    } catch (err: unknown) {
      const error = err as Error & { message?: string };
      console.error('Failed to save daily:', error);
      notification.error({
        message: 'Lỗi',
        description: error.message || 'Không thể lưu daily'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentProject) {
    return (
      <Alert
        message="Chưa chọn dự án"
        description="Vui lòng chọn dự án để nhập daily report"
        type="info"
        showIcon
      />
    );
  }

  const isToday = reportDate === dayjs().format('YYYY-MM-DD');
  const isPastDate = dayjs(reportDate).isBefore(dayjs(), 'day');

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <CalendarOutlined />
        <span style={{ fontWeight: 500 }}>
          Daily Report - {dayjs(reportDate).format('DD/MM/YYYY')}
        </span>
        {isToday && (
          <span style={{ color: '#52c41a', fontSize: '12px' }}>(Hôm nay)</span>
        )}
        {existingDaily && (
          <span style={{ color: '#1890ff', fontSize: '12px' }}>(Đã có daily)</span>
        )}
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        size="small"
      >
        <Form.Item
          label="Hôm qua đã làm gì?"
          name="yesterday"
          rules={[
            { required: true, message: 'Vui lòng nhập công việc đã làm' }
          ]}
        >
          <Form.Item name="yesterday" noStyle>
            <RichTextEditor
              placeholder="Mô tả chi tiết công việc đã hoàn thành hôm qua... (Có thể mention task bằng @TASK-001)"
              minHeight={100}
              maxHeight={200}
              enableTaskMentions={true}
            />
          </Form.Item>
        </Form.Item>

        <Form.Item
          label="Hôm nay sẽ làm gì?"
          name="today"
          rules={[
            { required: true, message: 'Vui lòng nhập kế hoạch công việc' }
          ]}
        >
          <Form.Item name="today" noStyle>
            <RichTextEditor
              placeholder="Kế hoạch công việc cụ thể cho hôm nay... (Có thể mention task bằng @TASK-002)"
              minHeight={100}
              maxHeight={200}
              enableTaskMentions={true}
            />
          </Form.Item>
        </Form.Item>

        <Form.Item
          label="Vướng mắc, khó khăn"
          name="blockers"
        >
          <Form.Item name="blockers" noStyle>
            <RichTextEditor
              placeholder="Những khó khăn cần hỗ trợ, vướng mắc cần giải quyết..."
              minHeight={80}
              maxHeight={150}
              enableTaskMentions={true}
            />
          </Form.Item>
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<SaveOutlined />}
            block
          >
            {existingDaily ? 'Cập nhật Daily' : 'Lưu Daily'}
          </Button>
        </Form.Item>
      </Form>

      {isPastDate && (
        <Alert
          message="Lưu ý"
          description="Bạn đang nhập daily cho ngày đã qua. Hãy đảm bảo thông tin chính xác."
          type="warning"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </div>
  );
};

export default DailyForm;
