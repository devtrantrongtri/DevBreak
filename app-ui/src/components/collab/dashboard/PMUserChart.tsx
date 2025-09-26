'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { UserProgressData, ChartType } from '@/types/collab';

interface PMUserChartProps {
  userProgress: UserProgressData;
  chartType: ChartType;
  isRangeMode: boolean;
  dateRange: [Date, Date] | null;
  height: number;
}

const PMUserChart: React.FC<PMUserChartProps> = ({
  userProgress,
  chartType,
  isRangeMode,
  dateRange,
  height
}) => {
  const { taskStats, progressHistory } = userProgress;

  // Colors for different chart elements
  const COLORS = {
    todo: '#d9d9d9',
    in_process: '#1890ff',
    ready_for_qc: '#fa8c16',
    done: '#52c41a',
    overdue: '#ff4d4f',
    primary: '#1890ff',
    secondary: '#52c41a'
  };

  // Prepare data based on chart type and mode
  const getChartData = () => {
    if (isRangeMode && dateRange) {
      // Range mode - show historical data
      return progressHistory.map(item => ({
        date: item.date,
        dateLabel: new Date(item.date).toLocaleDateString('vi-VN', { 
          month: 'short', 
          day: 'numeric' 
        }),
        completed: item.completed,
        total: item.total,
        throughput: item.throughput,
        progress: item.total > 0 ? (item.completed / item.total) * 100 : 0
      }));
    } else {
      // Single day mode - show current status
      switch (chartType) {
        case 'status':
          return [
            { name: 'Cần làm', value: taskStats.todo, color: COLORS.todo },
            { name: 'Đang làm', value: taskStats.in_process, color: COLORS.in_process },
            { name: 'Chờ QC', value: taskStats.ready_for_qc, color: COLORS.ready_for_qc },
            { name: 'Hoàn thành', value: taskStats.done, color: COLORS.done }
          ].filter(item => item.value > 0);
        
        case 'workload':
          return [
            { name: 'Hoàn thành', value: taskStats.done, color: COLORS.done },
            { name: 'Còn lại', value: taskStats.total - taskStats.done, color: COLORS.todo },
            { name: 'Quá hạn', value: taskStats.overdue, color: COLORS.overdue }
          ].filter(item => item.value > 0);
        
        default:
          return progressHistory.slice(-7); // Last 7 days for progress/throughput
      }
    }
  };

  const chartData = getChartData();

  // Debug log
  console.log('PMUserChart - chartData:', chartData, 'taskStats:', taskStats, 'chartType:', chartType);

  // Render different chart types
  const renderChart = () => {
    if (!chartData || chartData.length === 0) {
      // Show fallback chart with basic data
      const fallbackData = [
        { name: 'Cần làm', value: taskStats.todo || 0, color: COLORS.todo },
        { name: 'Đang làm', value: taskStats.in_process || 0, color: COLORS.in_process },
        { name: 'Hoàn thành', value: taskStats.done || 0, color: COLORS.done }
      ].filter(item => item.value > 0);

      if (fallbackData.length > 0) {
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={fallbackData}
                cx="50%"
                cy="50%"
                innerRadius={20}
                outerRadius={Math.min(height / 3, 40)}
                paddingAngle={2}
                dataKey="value"
              >
                {fallbackData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
            </PieChart>
          </ResponsiveContainer>
        );
      }

      return (
        <div style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999'
        }}>
          Không có dữ liệu
        </div>
      );
    }

    switch (chartType) {
      case 'progress':
        if (isRangeMode) {
          return (
            <ResponsiveContainer width="100%" height={height}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="dateLabel" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                />
                <YAxis hide />
                <Tooltip 
                  formatter={(value: number) => [
                    `${value}%`,
                    'Tiến độ'
                  ]}
                  labelFormatter={(label) => `Ngày: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="progress"
                  stroke={COLORS.primary}
                  fillOpacity={1}
                  fill="url(#progressGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          );
        } else {
          return (
            <ResponsiveContainer width="100%" height={height}>
              <BarChart data={chartData} layout="horizontal">
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="dateLabel" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Tiến độ']}
                />
                <Bar 
                  dataKey="progress" 
                  fill={COLORS.primary}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          );
        }

      case 'throughput':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData}>
              <XAxis 
                dataKey="dateLabel" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
              />
              <YAxis hide />
              <Tooltip 
                formatter={(value: number) => [`${value}`, 'Tasks hoàn thành']}
                labelFormatter={(label) => `Ngày: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="throughput"
                stroke={COLORS.secondary}
                strokeWidth={2}
                dot={{ fill: COLORS.secondary, strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'status':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={height * 0.2}
                outerRadius={height * 0.4}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => {
                  // Type assertion for status chart data
                  const statusEntry = entry as { name: string; value: number; color: string };
                  return <Cell key={`cell-${index}`} fill={statusEntry.color} />;
                })}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string) => [`${value}`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'workload':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={chartData}>
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
              />
              <YAxis hide />
              <Tooltip 
                formatter={(value: number) => [`${value}`, 'Tasks']}
              />
              <Bar 
                dataKey="value" 
                fill={COLORS.primary}
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => {
                  // Type assertion for workload chart data
                  const workloadEntry = entry as { name: string; value: number; color: string };
                  return <Cell key={`cell-${index}`} fill={workloadEntry.color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  // Debug logging
  console.log('[PMUserChart] Rendering with:', {
    chartType,
    isRangeMode,
    taskStats,
    progressHistory: progressHistory?.length || 0,
    chartData: getChartData()
  });

  try {
    return (
      <div className="pm-user-chart" style={{ width: '100%', height: height, minHeight: height }}>
        {renderChart()}
      </div>
    );
  } catch (error) {
    console.error('[PMUserChart] Error rendering chart:', error);

    // Fallback simple chart
    const completionPercentage = taskStats.total > 0
      ? Math.round((taskStats.done / taskStats.total) * 100)
      : 0;

    return (
      <div style={{
        width: '100%',
        height: height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        borderRadius: 4,
        border: '1px solid #d9d9d9'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff' }}>
            {completionPercentage}%
          </div>
          <div style={{ fontSize: 10, color: '#666' }}>
            {taskStats.done}/{taskStats.total}
          </div>
        </div>
      </div>
    );
  }
};

export default PMUserChart;
