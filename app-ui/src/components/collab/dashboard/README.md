# PM Daily Report Dashboard

Một component 2D chuyên dụng cho Project Manager để xem daily report của team và các vấn đề liên quan.

## Tính năng chính

### 🎯 Chế độ hiển thị
- **Single-row**: Mỗi user chiếm một hàng toàn màn hình (mặc định)
- **Grid**: Hiển thị dạng lưới cho nhiều user
- **Compact**: Chế độ gọn để tiết kiệm không gian

### 📊 Charts đa dạng
- **Progress**: Biểu đồ tiến độ hoàn thành
- **Throughput**: Năng suất làm việc theo thời gian
- **Status**: Phân bố trạng thái tasks (Pie chart)
- **Workload**: Khối lượng công việc (Bar chart)

### 🔍 Task Preview
- **Hover @TaskName**: Hiển thị popover với thông tin chi tiết task
- **Click @TaskName**: Điều hướng đến task trong kanban board
- **Real-time data**: Thông tin task được cập nhật theo thời gian thực

### 📅 Navigation linh hoạt
- **User-level navigation**: Mũi tên ▲/▼ để xem daily của user ở ngày khác
- **Global navigation**: DatePicker và nút Hôm trước/Hôm sau cho toàn bảng
- **Range mode**: Chuyển sang chế độ xem theo khoảng thời gian

## Cấu trúc Component

```
PMDailyReportDashboard/
├── PMDailyReportDashboard.tsx       # Component chính
├── PMDailyReportWrapper.tsx         # Wrapper với VisibilityWrapper
├── PMDashboardVisibilityControl.tsx # Quản lý visibility settings
├── PMUserProgressRow.tsx            # Row hiển thị thông tin user
├── PMUserChart.tsx                  # Charts cho từng user
├── PMProjectStats.tsx               # Thống kê tổng quan project
├── TaskPreviewPopover.tsx           # Popover preview task
├── PMDailyReportDashboard.scss      # Styles
└── index.ts                         # Exports
```

## 🔐 Component Visibility System

### Cơ chế hoạt động:
1. **Default**: Chỉ PM mới thấy dashboard
2. **Configurable**: PM có thể cấu hình để:
   - Hiển thị cho tất cả thành viên dự án
   - Hiển thị cho role cụ thể (PM, BC, DEV, QC)
3. **Per-project**: Mỗi dự án có cài đặt riêng
4. **Dynamic**: Thay đổi real-time không cần reload

## Props Interface

### PMDailyReportDashboard
```typescript
interface PMDailyReportDashboardProps {
  className?: string;
}
```

### PMUserProgressRow
```typescript
interface PMUserProgressRowProps {
  userProgress: UserProgressData;
  chartType: ChartType;
  isRangeMode: boolean;
  dateRange: [Date, Date] | null;
  selectedDate: Date;
  viewMode: ViewMode;
  onTaskClick: (taskId: string) => void;
}
```

## Data Types

### PMDashboardData
```typescript
interface PMDashboardData {
  projectId: string;
  reportDate: string;
  teamProgress: UserProgressData[];
  projectStats: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    blockedUsers: number;
    averageThroughput: number;
  };
}
```

### UserProgressData
```typescript
interface UserProgressData {
  userId: string;
  user: {
    id: string;
    displayName: string;
    email: string;
    avatar?: string;
  };
  role: 'PM' | 'BC' | 'DEV' | 'QC';
  dailyReport?: Daily;
  taskStats: {
    todo: number;
    in_process: number;
    ready_for_qc: number;
    done: number;
    total: number;
    completedToday: number;
    overdue: number;
  };
  progressHistory: {
    date: string;
    completed: number;
    total: number;
    throughput: number;
  }[];
  recentTasks: Task[];
}
```

## API Endpoints

```typescript
// Lấy dữ liệu dashboard PM
GET /api/collab/projects/:projectId/pm-dashboard?date=yyyy-mm-dd

// Lấy dữ liệu tiến độ user
GET /api/collab/projects/:projectId/users/:userId/progress?date=yyyy-mm-dd

// Preview task
GET /api/collab/tasks/:taskId/preview
```

## Sử dụng

### Basic Usage
```tsx
import { PMDailyReportDashboard } from '@/components/collab/dashboard';

function MyPage() {
  return (
    <PMDailyReportDashboard />
  );
}
```

### Với Role-based Access
```tsx
import { PMDailyReportDashboard } from '@/components/collab/dashboard';
import { RoleBasedComponent } from '@/components/collab/common';

function MyPage() {
  return (
    <RoleBasedComponent allowedRoles={['PM']} userRole={userRole}>
      <PMDailyReportDashboard />
    </RoleBasedComponent>
  );
}
```

## Styling

Component sử dụng SCSS modules với các class chính:
- `.pm-daily-report-dashboard`: Container chính
- `.dashboard-header`: Header với controls
- `.date-navigation`: Navigation ngày tháng
- `.team-progress-container`: Container cho team progress
- `.pm-user-progress-row`: Row cho từng user
- `.chart-section`: Phần chart bên trái (30%)
- `.info-section`: Phần thông tin bên phải (70%)

## Responsive Design

- **Desktop**: Layout 2 cột (30% chart, 70% info)
- **Tablet**: Giữ nguyên layout nhưng điều chỉnh spacing
- **Mobile**: Stack vertical, chart và info xếp chồng

## Performance

- **Lazy loading**: Charts chỉ render khi cần thiết
- **Memoization**: Tránh re-render không cần thiết
- **API caching**: Cache dữ liệu để giảm API calls
- **Virtual scrolling**: Cho danh sách user dài

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- React 18+
- Ant Design 5+
- Recharts 2+
- date-fns 2+
