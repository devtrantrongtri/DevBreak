'use client';

/**
 * Utility functions để xử lý thời gian một cách consistent
 * Giải quyết vấn đề timezone và date parsing
 */

export interface TimeAgoResult {
  text: string;
  diffInMinutes: number;
  isAccurate: boolean;
}

/**
 * Parse date string/object thành Date object an toàn
 */
export const parseDate = (dateInput: string | Date | number): Date => {
  if (dateInput instanceof Date) {
    return dateInput;
  }
  
  if (typeof dateInput === 'number') {
    return new Date(dateInput);
  }
  
  if (typeof dateInput === 'string') {
    // Handle ISO string
    if (dateInput.includes('T') || dateInput.includes('Z')) {
      return new Date(dateInput);
    }
    
    // Handle other formats
    return new Date(dateInput);
  }
  
  throw new Error(`Invalid date input: ${dateInput}`);
};

/**
 * Tính khoảng cách thời gian bằng tiếng Việt
 */
export const getVietnameseTimeAgo = (
  dateInput: string | Date | number,
  now?: Date
): TimeAgoResult => {
  const activityDate = parseDate(dateInput);
  const currentDate = now || new Date();
  
  // Validate dates
  if (isNaN(activityDate.getTime())) {
    return {
      text: 'thời gian không hợp lệ',
      diffInMinutes: 0,
      isAccurate: false,
    };
  }
  
  if (isNaN(currentDate.getTime())) {
    return {
      text: 'thời gian hiện tại không hợp lệ',
      diffInMinutes: 0,
      isAccurate: false,
    };
  }
  
  // Calculate difference
  const diffInMs = currentDate.getTime() - activityDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  
  // Handle future dates (clock skew)
  if (diffInMinutes < 0) {
    return {
      text: 'vừa xong',
      diffInMinutes: 0,
      isAccurate: false,
    };
  }
  
  // Generate Vietnamese text
  let text: string;
  let isAccurate = true;
  
  if (diffInMinutes < 1) {
    text = 'vừa xong';
  } else if (diffInMinutes < 60) {
    text = `${diffInMinutes} phút trước`;
  } else if (diffInMinutes < 1440) { // 24 hours
    const hours = Math.floor(diffInMinutes / 60);
    text = `${hours} giờ trước`;
  } else if (diffInMinutes < 10080) { // 7 days
    const days = Math.floor(diffInMinutes / 1440);
    text = `${days} ngày trước`;
  } else if (diffInMinutes < 43200) { // 30 days
    const weeks = Math.floor(diffInMinutes / 10080);
    text = `${weeks} tuần trước`;
  } else if (diffInMinutes < 525600) { // 365 days
    const months = Math.floor(diffInMinutes / 43200);
    text = `${months} tháng trước`;
  } else {
    const years = Math.floor(diffInMinutes / 525600);
    text = `${years} năm trước`;
    isAccurate = false; // Very old dates might be less accurate
  }
  
  return {
    text,
    diffInMinutes,
    isAccurate,
  };
};

/**
 * Format time cho display (HH:mm)
 */
export const formatTime = (dateInput: string | Date | number): string => {
  try {
    const date = parseDate(dateInput);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return '--:--';
  }
};

/**
 * Format date cho display (dd/MM/yyyy)
 */
export const formatDate = (dateInput: string | Date | number): string => {
  try {
    const date = parseDate(dateInput);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '--/--/----';
  }
};

/**
 * Format datetime cho display (dd/MM/yyyy HH:mm)
 */
export const formatDateTime = (dateInput: string | Date | number): string => {
  try {
    const date = parseDate(dateInput);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return '--/--/---- --:--';
  }
};

/**
 * Debug function để log thông tin thời gian
 */
export const debugTime = (
  dateInput: string | Date | number,
  label: string = 'Date'
): void => {
  try {
    const date = parseDate(dateInput);
    const now = new Date();
    const timeAgo = getVietnameseTimeAgo(dateInput, now);
    
    console.group(`🕐 ${label} Debug`);
    console.log('Input:', dateInput);
    console.log('Parsed Date:', date);
    console.log('ISO String:', date.toISOString());
    console.log('Local String:', date.toLocaleString('vi-VN'));
    console.log('Current Time:', now.toLocaleString('vi-VN'));
    console.log('Time Ago:', timeAgo);
    console.log('Diff (minutes):', timeAgo.diffInMinutes);
    console.groupEnd();
  } catch (error) {
    console.error(`Error debugging time for ${label}:`, error);
  }
};
