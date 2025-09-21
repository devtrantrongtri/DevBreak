import React from 'react';
import {
  // General
  DashboardOutlined,
  SettingOutlined,
  UserOutlined,
  TeamOutlined,
  MenuOutlined,
  FileOutlined,
  FolderOutlined,
  HomeOutlined,
  AppstoreOutlined,
  
  // Actions
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined,
  
  // Navigation
  LeftOutlined,
  RightOutlined,
  UpOutlined,
  DownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  
  // Status
  CheckOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  
  // Business
  ShoppingCartOutlined,
  ShopOutlined,
  BankOutlined,
  CreditCardOutlined,
  DollarOutlined,
  EuroOutlined,
  
  // Communication
  MailOutlined,
  MessageOutlined,
  PhoneOutlined,
  NotificationOutlined,
  BellOutlined,
  
  // Media
  PictureOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  
  // Security
  SafetyCertificateOutlined,
  LockOutlined,
  UnlockOutlined,
  KeyOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  
  // System
  DatabaseOutlined,
  CloudOutlined,
  ApiOutlined,
  CodeOutlined,
  BugOutlined,
  
  // Tools
  ToolOutlined,
  CalculatorOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  
  // Social
  LikeOutlined,
  DislikeOutlined,
  HeartOutlined,
  StarOutlined,
  ShareAltOutlined,
  
  // Layout
  LayoutOutlined,
  TableOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  
  // Misc
  GiftOutlined,
  TrophyOutlined,
  CrownOutlined,
  FireOutlined,
  ThunderboltOutlined,
  RocketOutlined,
} from '@ant-design/icons';

export interface IconOption {
  value: string;
  label: string;
  icon: React.ReactNode;
  category: string;
}

export const ICON_CATEGORIES = {
  GENERAL: 'Tổng quát',
  ACTIONS: 'Hành động',
  NAVIGATION: 'Điều hướng',
  STATUS: 'Trạng thái',
  BUSINESS: 'Kinh doanh',
  COMMUNICATION: 'Giao tiếp',
  MEDIA: 'Phương tiện',
  SECURITY: 'Bảo mật',
  SYSTEM: 'Hệ thống',
  TOOLS: 'Công cụ',
  SOCIAL: 'Xã hội',
  LAYOUT: 'Bố cục',
  MISC: 'Khác',
};

export const AVAILABLE_ICONS: IconOption[] = [
  // General
  { value: 'DashboardOutlined', label: 'Dashboard', icon: <DashboardOutlined />, category: ICON_CATEGORIES.GENERAL },
  { value: 'SettingOutlined', label: 'Cài đặt', icon: <SettingOutlined />, category: ICON_CATEGORIES.GENERAL },
  { value: 'UserOutlined', label: 'Người dùng', icon: <UserOutlined />, category: ICON_CATEGORIES.GENERAL },
  { value: 'TeamOutlined', label: 'Nhóm', icon: <TeamOutlined />, category: ICON_CATEGORIES.GENERAL },
  { value: 'MenuOutlined', label: 'Menu', icon: <MenuOutlined />, category: ICON_CATEGORIES.GENERAL },
  { value: 'FileOutlined', label: 'Tệp', icon: <FileOutlined />, category: ICON_CATEGORIES.GENERAL },
  { value: 'FolderOutlined', label: 'Thư mục', icon: <FolderOutlined />, category: ICON_CATEGORIES.GENERAL },
  { value: 'HomeOutlined', label: 'Trang chủ', icon: <HomeOutlined />, category: ICON_CATEGORIES.GENERAL },
  { value: 'AppstoreOutlined', label: 'Ứng dụng', icon: <AppstoreOutlined />, category: ICON_CATEGORIES.GENERAL },
  
  // Actions
  { value: 'EditOutlined', label: 'Chỉnh sửa', icon: <EditOutlined />, category: ICON_CATEGORIES.ACTIONS },
  { value: 'DeleteOutlined', label: 'Xóa', icon: <DeleteOutlined />, category: ICON_CATEGORIES.ACTIONS },
  { value: 'PlusOutlined', label: 'Thêm', icon: <PlusOutlined />, category: ICON_CATEGORIES.ACTIONS },
  { value: 'SaveOutlined', label: 'Lưu', icon: <SaveOutlined />, category: ICON_CATEGORIES.ACTIONS },
  { value: 'SearchOutlined', label: 'Tìm kiếm', icon: <SearchOutlined />, category: ICON_CATEGORIES.ACTIONS },
  { value: 'FilterOutlined', label: 'Lọc', icon: <FilterOutlined />, category: ICON_CATEGORIES.ACTIONS },
  { value: 'ReloadOutlined', label: 'Tải lại', icon: <ReloadOutlined />, category: ICON_CATEGORIES.ACTIONS },
  { value: 'DownloadOutlined', label: 'Tải xuống', icon: <DownloadOutlined />, category: ICON_CATEGORIES.ACTIONS },
  { value: 'UploadOutlined', label: 'Tải lên', icon: <UploadOutlined />, category: ICON_CATEGORIES.ACTIONS },
  
  // Navigation
  { value: 'LeftOutlined', label: 'Trái', icon: <LeftOutlined />, category: ICON_CATEGORIES.NAVIGATION },
  { value: 'RightOutlined', label: 'Phải', icon: <RightOutlined />, category: ICON_CATEGORIES.NAVIGATION },
  { value: 'UpOutlined', label: 'Lên', icon: <UpOutlined />, category: ICON_CATEGORIES.NAVIGATION },
  { value: 'DownOutlined', label: 'Xuống', icon: <DownOutlined />, category: ICON_CATEGORIES.NAVIGATION },
  
  // Status
  { value: 'CheckOutlined', label: 'Đúng', icon: <CheckOutlined />, category: ICON_CATEGORIES.STATUS },
  { value: 'CloseOutlined', label: 'Đóng', icon: <CloseOutlined />, category: ICON_CATEGORIES.STATUS },
  { value: 'CheckCircleOutlined', label: 'Thành công', icon: <CheckCircleOutlined />, category: ICON_CATEGORIES.STATUS },
  { value: 'CloseCircleOutlined', label: 'Lỗi', icon: <CloseCircleOutlined />, category: ICON_CATEGORIES.STATUS },
  { value: 'ExclamationCircleOutlined', label: 'Cảnh báo', icon: <ExclamationCircleOutlined />, category: ICON_CATEGORIES.STATUS },
  { value: 'InfoCircleOutlined', label: 'Thông tin', icon: <InfoCircleOutlined />, category: ICON_CATEGORIES.STATUS },
  
  // Business
  { value: 'ShoppingCartOutlined', label: 'Giỏ hàng', icon: <ShoppingCartOutlined />, category: ICON_CATEGORIES.BUSINESS },
  { value: 'ShopOutlined', label: 'Cửa hàng', icon: <ShopOutlined />, category: ICON_CATEGORIES.BUSINESS },
  { value: 'BankOutlined', label: 'Ngân hàng', icon: <BankOutlined />, category: ICON_CATEGORIES.BUSINESS },
  { value: 'CreditCardOutlined', label: 'Thẻ tín dụng', icon: <CreditCardOutlined />, category: ICON_CATEGORIES.BUSINESS },
  { value: 'DollarOutlined', label: 'Tiền tệ', icon: <DollarOutlined />, category: ICON_CATEGORIES.BUSINESS },
  
  // Communication
  { value: 'MailOutlined', label: 'Email', icon: <MailOutlined />, category: ICON_CATEGORIES.COMMUNICATION },
  { value: 'MessageOutlined', label: 'Tin nhắn', icon: <MessageOutlined />, category: ICON_CATEGORIES.COMMUNICATION },
  { value: 'PhoneOutlined', label: 'Điện thoại', icon: <PhoneOutlined />, category: ICON_CATEGORIES.COMMUNICATION },
  { value: 'NotificationOutlined', label: 'Thông báo', icon: <NotificationOutlined />, category: ICON_CATEGORIES.COMMUNICATION },
  { value: 'BellOutlined', label: 'Chuông', icon: <BellOutlined />, category: ICON_CATEGORIES.COMMUNICATION },
  
  // Security
  { value: 'SafetyCertificateOutlined', label: 'Bảo mật', icon: <SafetyCertificateOutlined />, category: ICON_CATEGORIES.SECURITY },
  { value: 'LockOutlined', label: 'Khóa', icon: <LockOutlined />, category: ICON_CATEGORIES.SECURITY },
  { value: 'UnlockOutlined', label: 'Mở khóa', icon: <UnlockOutlined />, category: ICON_CATEGORIES.SECURITY },
  { value: 'KeyOutlined', label: 'Chìa khóa', icon: <KeyOutlined />, category: ICON_CATEGORIES.SECURITY },
  { value: 'EyeOutlined', label: 'Xem', icon: <EyeOutlined />, category: ICON_CATEGORIES.SECURITY },
  
  // System
  { value: 'DatabaseOutlined', label: 'Cơ sở dữ liệu', icon: <DatabaseOutlined />, category: ICON_CATEGORIES.SYSTEM },
  { value: 'CloudOutlined', label: 'Đám mây', icon: <CloudOutlined />, category: ICON_CATEGORIES.SYSTEM },
  { value: 'ApiOutlined', label: 'API', icon: <ApiOutlined />, category: ICON_CATEGORIES.SYSTEM },
  { value: 'CodeOutlined', label: 'Mã nguồn', icon: <CodeOutlined />, category: ICON_CATEGORIES.SYSTEM },
  { value: 'BugOutlined', label: 'Lỗi', icon: <BugOutlined />, category: ICON_CATEGORIES.SYSTEM },

  // Tools
  { value: 'ToolOutlined', label: 'Công cụ', icon: <ToolOutlined />, category: ICON_CATEGORIES.TOOLS },
  { value: 'CalculatorOutlined', label: 'Máy tính', icon: <CalculatorOutlined />, category: ICON_CATEGORIES.TOOLS },
  { value: 'CalendarOutlined', label: 'Lịch', icon: <CalendarOutlined />, category: ICON_CATEGORIES.TOOLS },
  { value: 'ClockCircleOutlined', label: 'Đồng hồ', icon: <ClockCircleOutlined />, category: ICON_CATEGORIES.TOOLS },
  
  // Layout
  { value: 'LayoutOutlined', label: 'Bố cục', icon: <LayoutOutlined />, category: ICON_CATEGORIES.LAYOUT },
  { value: 'TableOutlined', label: 'Bảng', icon: <TableOutlined />, category: ICON_CATEGORIES.LAYOUT },
  { value: 'OrderedListOutlined', label: 'Danh sách có thứ tự', icon: <OrderedListOutlined />, category: ICON_CATEGORIES.LAYOUT },
  { value: 'UnorderedListOutlined', label: 'Danh sách', icon: <UnorderedListOutlined />, category: ICON_CATEGORIES.LAYOUT },
  
  // Misc
  { value: 'GiftOutlined', label: 'Quà tặng', icon: <GiftOutlined />, category: ICON_CATEGORIES.MISC },
  { value: 'TrophyOutlined', label: 'Cúp', icon: <TrophyOutlined />, category: ICON_CATEGORIES.MISC },
  { value: 'CrownOutlined', label: 'Vương miện', icon: <CrownOutlined />, category: ICON_CATEGORIES.MISC },
  { value: 'FireOutlined', label: 'Lửa', icon: <FireOutlined />, category: ICON_CATEGORIES.MISC },
  { value: 'ThunderboltOutlined', label: 'Sét', icon: <ThunderboltOutlined />, category: ICON_CATEGORIES.MISC },
  { value: 'RocketOutlined', label: 'Tên lửa', icon: <RocketOutlined />, category: ICON_CATEGORIES.MISC },
];

// Icon map for rendering
export const ICON_MAP: Record<string, React.ReactNode> = {
  'DashboardOutlined': <DashboardOutlined />,
  'SettingOutlined': <SettingOutlined />,
  'UserOutlined': <UserOutlined />,
  'TeamOutlined': <TeamOutlined />,
  'MenuOutlined': <MenuOutlined />,
  'FileOutlined': <FileOutlined />,
  'FolderOutlined': <FolderOutlined />,
  'HomeOutlined': <HomeOutlined />,
  'AppstoreOutlined': <AppstoreOutlined />,
  'EditOutlined': <EditOutlined />,
  'DeleteOutlined': <DeleteOutlined />,
  'PlusOutlined': <PlusOutlined />,
  'SaveOutlined': <SaveOutlined />,
  'SearchOutlined': <SearchOutlined />,
  'FilterOutlined': <FilterOutlined />,
  'ReloadOutlined': <ReloadOutlined />,
  'DownloadOutlined': <DownloadOutlined />,
  'UploadOutlined': <UploadOutlined />,
  'LeftOutlined': <LeftOutlined />,
  'RightOutlined': <RightOutlined />,
  'UpOutlined': <UpOutlined />,
  'DownOutlined': <DownOutlined />,
  'CheckOutlined': <CheckOutlined />,
  'CloseOutlined': <CloseOutlined />,
  'CheckCircleOutlined': <CheckCircleOutlined />,
  'CloseCircleOutlined': <CloseCircleOutlined />,
  'ExclamationCircleOutlined': <ExclamationCircleOutlined />,
  'InfoCircleOutlined': <InfoCircleOutlined />,
  'ShoppingCartOutlined': <ShoppingCartOutlined />,
  'ShopOutlined': <ShopOutlined />,
  'BankOutlined': <BankOutlined />,
  'CreditCardOutlined': <CreditCardOutlined />,
  'DollarOutlined': <DollarOutlined />,
  'MailOutlined': <MailOutlined />,
  'MessageOutlined': <MessageOutlined />,
  'PhoneOutlined': <PhoneOutlined />,
  'NotificationOutlined': <NotificationOutlined />,
  'BellOutlined': <BellOutlined />,
  'SafetyCertificateOutlined': <SafetyCertificateOutlined />,
  'LockOutlined': <LockOutlined />,
  'UnlockOutlined': <UnlockOutlined />,
  'KeyOutlined': <KeyOutlined />,
  'EyeOutlined': <EyeOutlined />,
  'DatabaseOutlined': <DatabaseOutlined />,
  'CloudOutlined': <CloudOutlined />,
  'ApiOutlined': <ApiOutlined />,
  'CodeOutlined': <CodeOutlined />,
  'BugOutlined': <BugOutlined />,
  'ToolOutlined': <ToolOutlined />,
  'CalculatorOutlined': <CalculatorOutlined />,
  'CalendarOutlined': <CalendarOutlined />,
  'ClockCircleOutlined': <ClockCircleOutlined />,
  'LayoutOutlined': <LayoutOutlined />,
  'TableOutlined': <TableOutlined />,
  'OrderedListOutlined': <OrderedListOutlined />,
  'UnorderedListOutlined': <UnorderedListOutlined />,
  'GiftOutlined': <GiftOutlined />,
  'TrophyOutlined': <TrophyOutlined />,
  'CrownOutlined': <CrownOutlined />,
  'FireOutlined': <FireOutlined />,
  'ThunderboltOutlined': <ThunderboltOutlined />,
  'RocketOutlined': <RocketOutlined />,
};

export const getIconByName = (iconName?: string): React.ReactNode => {
  return ICON_MAP[iconName || ''] || <FileOutlined />;
};
