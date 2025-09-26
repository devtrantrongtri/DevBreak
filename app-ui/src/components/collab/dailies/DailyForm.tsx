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

  // Đảm bảo date luôn là chuỗi với định dạng YYYY-MM-DD
  // Sử dụng String() để đảm bảo luôn là chuỗi
  const dateValue = String(selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'));
  console.log('Initial date value:', dateValue, 'Type:', typeof dateValue);

  // Load existing daily for the selected date
  useEffect(() => {
    if (currentProject) {
      loadExistingDaily();
    }
  }, [currentProject, dateValue]);

  const loadExistingDaily = async () => {
    if (!currentProject) return;

    try {
      // Đảm bảo date query param là chuỗi với định dạng YYYY-MM-DD
      const dateParam = String(dateValue);
      console.log('Loading daily with date param:', dateParam);
      
      const response = await apiClient.request<Daily[]>(
        `/collab/dailies/my?date=${dateParam}`
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
        // Đảm bảo date là chuỗi với định dạng YYYY-MM-DD
        // Sử dụng trực tiếp dateValue đã được format ở trên
        console.log('Using date value:', dateValue, 'Type:', typeof dateValue);
        
        // Kiểm tra định dạng ngày trước khi gửi request
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dateValue)) {
          throw new Error(`Invalid date format: ${dateValue}. Expected format: YYYY-MM-DD`);
        }
        
        // Tạo dữ liệu gửi đi với reportDate là chuỗi YYYY-MM-DD
        // Sử dụng một cách tiếp cận khác để đảm bảo reportDate là chuỗi
        
        // Tạo object với date là chuỗi (thay vì reportDate để khớp với backend DTO)
        const rawData = {
          projectId: String(currentProject.id),
          date: String(dateValue),  
          yesterday: String(values.yesterday || ''),
          today: String(values.today || ''),
          blockers: String(values.blockers || ''),
        };
        
        // Kiểm tra và in ra thông tin về dữ liệu
        console.log('Raw data before sending:', rawData);
        console.log('date value:', rawData.date);
        console.log('date type:', typeof rawData.date);
        
        // Gửi request trực tiếp với dữ liệu JSON
        // Tạo chuỗi JSON một cách thủ công để đảm bảo date là chuỗi
        const manualJsonBody = `{
          "projectId": "${currentProject.id}",
          "date": "${dateValue}",
          "yesterday": ${JSON.stringify(values.yesterday || '')},
          "today": ${JSON.stringify(values.today || '')},
          "blockers": ${JSON.stringify(values.blockers || '')}
        }`;
        
        console.log('Manual JSON body:', manualJsonBody);
        
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/collab/dailies`;
        const token = localStorage.getItem('accessToken');
        
        const fetchResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: manualJsonBody
        });
        
        // In ra response headers để kiểm tra
        console.log('Response status:', fetchResponse.status);
        console.log('Response headers:', Object.fromEntries([...fetchResponse.headers.entries()]));
        
        if (!fetchResponse.ok) {
          const errorText = await fetchResponse.text();
          console.error('Error response text:', errorText);
          
          try {
            const errorData = JSON.parse(errorText);
            console.error('Parsed error data:', errorData);
            throw new Error(errorData.message || `HTTP error! status: ${fetchResponse.status}`);
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            throw new Error(`HTTP error! status: ${fetchResponse.status}. Response: ${errorText}`);
          }
        }
        
        const response = await fetchResponse.json();

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

  // Kiểm tra ngày hiện tại và ngày quá khứ
  const isToday = dayjs(dateValue).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');
  const isPastDate = dayjs(dateValue).isBefore(dayjs(), 'day');

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <CalendarOutlined />
        <span style={{ fontWeight: 500 }}>
          Daily Report - {dayjs(dateValue).format('DD/MM/YYYY')}
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
