'use client';

import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Button,
  message,
  Space,
  Typography,
  Alert
} from 'antd';
import { CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import { useProject } from '@/contexts/ProjectContext';
import { apiClient } from '@/lib/api';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

interface CreateDailyModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  selectedDate?: dayjs.Dayjs;
}

interface CreateDailyForm {
  date: dayjs.Dayjs;
  yesterday: string;
  today: string;
  blockers?: string;
}

const CreateDailyModal: React.FC<CreateDailyModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  selectedDate
}) => {
  const [form] = Form.useForm<CreateDailyForm>();
  const [loading, setLoading] = useState(false);
  const { currentProject } = useProject();

  const handleSubmit = async (values: CreateDailyForm) => {
    if (!currentProject) return;

    try {
      setLoading(true);

      const dailyData = {
        projectId: currentProject.id,
        date: values.date.format('YYYY-MM-DD'),
        yesterday: values.yesterday,
        today: values.today,
        blockers: values.blockers || '',
      };

      console.log('Sending daily data:', dailyData);

      await apiClient.request('/collab/dailies', {
        method: 'POST',
        data: dailyData
      });

      message.success('Tạo daily report thành công!');
      form.resetFields();
      onSuccess?.();
      onCancel();
    } catch (error: any) {
      console.error('Create daily failed:', error);

      // Handle validation errors
      if (error?.response?.data?.message) {
        const errorMessages = Array.isArray(error.response.data.message)
          ? error.response.data.message
          : [error.response.data.message];

        errorMessages.forEach((msg: string) => {
          message.error(msg);
        });
      } else {
        message.error(error?.message || 'Tạo daily report thất bại');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <Space>
          <CalendarOutlined />
          Tạo Daily Report
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={700}
      style={{ top: 20 }}
      styles={{
        body: { 
          maxHeight: 'calc(100vh - 200px)', 
          overflowY: 'auto',
          padding: '24px'
        },
        header: { 
          padding: '16px 24px', 
          borderBottom: '1px solid #f0f0f0' 
        }
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          date: selectedDate || dayjs()
        }}
      >
        <Form.Item
          name="date"
          label="Ngày"
          rules={[
            { required: true, message: 'Vui lòng chọn ngày' }
          ]}
        >
          <DatePicker
            size="large"
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            disabledDate={(current) => current && current > dayjs().endOf('day')}
          />
        </Form.Item>

        <Alert
          message="Daily Report Format"
          description="Mỗi user chỉ có thể tạo 1 daily report cho mỗi ngày trong mỗi dự án."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form.Item
          name="yesterday"
          label="Hôm qua đã làm gì? (Yesterday)"
          rules={[
            { required: true, message: 'Vui lòng nhập công việc đã làm hôm qua' },
            { min: 10, message: 'Nội dung phải có ít nhất 10 ký tự' }
          ]}
        >
          <TextArea
            placeholder="- Hoàn thành task ABC&#10;- Review code cho feature XYZ&#10;- Meeting với team về requirements..."
            rows={4}
            maxLength={1000}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="today"
          label="Hôm nay sẽ làm gì? (Today)"
          rules={[
            { required: true, message: 'Vui lòng nhập kế hoạch công việc hôm nay' },
            { min: 10, message: 'Nội dung phải có ít nhất 10 ký tự' }
          ]}
        >
          <TextArea
            placeholder="- Implement feature DEF&#10;- Fix bug trong module GHI&#10;- Prepare demo cho client..."
            rows={4}
            maxLength={1000}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="blockers"
          label="Blockers / Vấn đề cần hỗ trợ (Optional)"
        >
          <TextArea
            placeholder="- Cần clarify requirements cho feature ABC&#10;- Chờ API từ team backend&#10;- Cần review từ senior developer..."
            rows={3}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: 8,
          marginTop: 24,
          paddingTop: 16,
          borderTop: '1px solid #f0f0f0'
        }}>
          <Button onClick={handleCancel} size="large">
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<PlusOutlined />}
            size="large"
          >
            Tạo Daily Report
          </Button>
        </div>
      </Form>

      <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f6f8fa', borderRadius: 6 }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          💡 <strong>Tips:</strong> Daily report giúp team theo dõi tiến độ và phát hiện blockers sớm. 
          Hãy viết rõ ràng và cụ thể để team có thể hỗ trợ khi cần.
        </Text>
      </div>
    </Modal>
  );
};

export default CreateDailyModal;
