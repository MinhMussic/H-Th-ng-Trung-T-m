import { AttendanceStatus, Student, Guardian } from '../types';

export interface PushNotificationPayload {
  studentId: string;
  studentName: string;
  studentCode?: string;
  className: string;
  subjectName: string;
  attendanceDate: string;
  attendanceTime: string;
  sessionNumber?: number;
  status: AttendanceStatus;
  starsAwarded: number;
  evaluation?: string;
  note?: string;
  recordedBy: string;
  verifiedBy?: string;
  completedLessons?: number;
  totalLessons?: number;
  remainingLessons?: number;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelation?: string;
  channels?: ('WEB_PUSH' | 'IN_APP_BANNER' | 'SMS_ZALO_GATEWAY')[];
}

export interface PushNotificationResult {
  title: string;
  body: string;
  shortSms: string;
  timestamp: string;
  statusColor: string;
  statusIcon: string;
  statusLabel: string;
}

/**
 * Format status text and badge
 */
export const getAttendanceStatusDisplay = (status: AttendanceStatus, stars: number = 0) => {
  switch (status) {
    case 'present':
      return {
        label: 'Có mặt đúng giờ',
        shortLabel: 'Có mặt',
        badge: '✅ Có mặt (+2⭐)',
        color: 'emerald',
        icon: '✓',
        starsText: '+2⭐'
      };
    case 'late':
      return {
        label: 'Đến muộn',
        shortLabel: 'Đi muộn',
        badge: '⏰ Đến muộn (+1⭐)',
        color: 'purple',
        icon: '⏱',
        starsText: '+1⭐'
      };
    case 'absent_excused':
    case 'absent_with_leave':
      return {
        label: 'Nghỉ học có phép',
        shortLabel: 'Nghỉ phép',
        badge: '📋 Nghỉ có phép (0⭐)',
        color: 'amber',
        icon: '📋',
        starsText: '0⭐'
      };
    case 'absent_unexcused':
    case 'absent_no_leave':
      return {
        label: 'Vắng mặt không phép',
        shortLabel: 'Vắng không phép',
        badge: '⚠️ Vắng không phép (-2⭐)',
        color: 'rose',
        icon: '✕',
        starsText: '-2⭐'
      };
    case 'makeup':
      return {
        label: 'Hoàn thành học bù',
        shortLabel: 'Học bù',
        badge: '🔄 Đã học bù (+2⭐)',
        color: 'blue',
        icon: '🔄',
        starsText: '+2⭐'
      };
    default:
      return {
        label: 'Đã điểm danh',
        shortLabel: 'Điểm danh',
        badge: '✓ Đã điểm danh',
        color: 'slate',
        icon: '•',
        starsText: `${stars >= 0 ? '+' : ''}${stars}⭐`
      };
  }
};

/**
 * Formats a courteous, detailed pedagogical push notification message for parents
 */
export const formatAttendancePushMessage = (payload: PushNotificationPayload): PushNotificationResult => {
  const statusInfo = getAttendanceStatusDisplay(payload.status, payload.starsAwarded);
  const student = payload.studentName;
  const time = payload.attendanceTime || new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const date = payload.attendanceDate;
  const verifier = payload.verifiedBy || payload.recordedBy || 'Giáo viên phụ trách';
  const cls = payload.className;
  const sub = payload.subjectName;

  let title = '';
  if (payload.status === 'present') {
    title = `✅ [Điểm Danh] Bé ${student} đã có mặt tại lớp ${cls} (+2⭐)`;
  } else if (payload.status === 'late') {
    title = `⏰ [Điểm Danh] Bé ${student} đến lớp ${cls} (+1⭐)`;
  } else if (payload.status === 'absent_excused' || payload.status === 'absent_with_leave') {
    title = `📋 [Điểm Danh] Đã ghi nhận bé ${student} nghỉ có phép lớp ${cls}`;
  } else if (payload.status === 'absent_unexcused' || payload.status === 'absent_no_leave') {
    title = `⚠️ [Cảnh Báo Chuyên Cần] Bé ${student} VẮNG MẶT lớp ${cls} (-2⭐)`;
  } else if (payload.status === 'makeup') {
    title = `🔄 [Học Bù] Bé ${student} đã hoàn thành buổi học bù môn ${sub}`;
  } else {
    title = `📝 [Điểm Danh] Cập nhật chuyên cần môn ${sub} - Bé ${student}`;
  }

  const remarks = (payload.evaluation || payload.note || '').trim();
  const sessionProgress = payload.totalLessons && payload.completedLessons !== undefined 
    ? `Tiến độ: Buổi ${payload.completedLessons}/${payload.totalLessons} (Còn ${payload.remainingLessons ?? Math.max(0, payload.totalLessons - payload.completedLessons)} buổi).` 
    : '';

  const parentSalutation = payload.guardianName 
    ? `Kính gửi ${payload.guardianRelation || 'Phụ huynh'} ${payload.guardianName}:` 
    : 'Kính gửi Quý Phụ huynh:';

  let advice = '';
  if (payload.status === 'absent_unexcused' || payload.status === 'absent_no_leave') {
    advice = '\n\n⚠️ Kính mong Quý Phụ huynh kiểm tra lại thông tin và gửi đơn xin học bù trên ứng dụng hoặc liên hệ trung tâm để được sắp xếp lịch học bù kịp thời cho con!';
  } else if (payload.status === 'absent_excused' || payload.status === 'absent_with_leave') {
    advice = '\n\n💡 Quý Phụ huynh có thể chủ động chọn lịch học bù cho bé ngay trong mục "Xếp lịch học bù" trên ứng dụng Minh Music.';
  } else {
    advice = '\n\n✨ Cảm ơn Quý Phụ huynh luôn tin tưởng và đồng hành cùng Trung tâm Âm nhạc Minh Music!';
  }

  const body = `${parentSalutation}
Vào lúc ${time} ngày ${date}, ${verifier} đã xác nhận điểm danh cho học viên ${student} tại lớp ${cls} (${sub}).
• Trạng thái: ${statusInfo.label} (${statusInfo.starsText})
${remarks ? `• Lời nhắn / Đánh giá của giáo viên: "${remarks}"\n` : ''}${sessionProgress ? `• ${sessionProgress}` : ''}${advice}`;

  const shortSms = `[MINH MUSIC] Lúc ${time} ${date}: Bé ${student} - ${cls} (${sub}) được ghi nhận "${statusInfo.shortLabel}" (${statusInfo.starsText}). ${remarks ? `Nhận xét: "${remarks}". ` : ''}${sessionProgress} Chi tiết xem tại app Minh Music.`;

  return {
    title,
    body,
    shortSms,
    timestamp: `${time}, ${date}`,
    statusColor: statusInfo.color,
    statusIcon: statusInfo.icon,
    statusLabel: statusInfo.label
  };
};

/**
 * Request Web Push Notification Permission
 */
export const requestWebPushPermission = async (): Promise<NotificationPermission> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    localStorage.setItem('minh_music_web_push_permission', permission);
    return permission;
  } catch (error) {
    console.warn('Error requesting notification permission:', error);
    return 'denied';
  }
};

/**
 * Get current Web Push Permission status
 */
export const getWebPushPermissionStatus = (): NotificationPermission => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
};

/**
 * Trigger native browser Web Push Notification if permitted
 */
export const triggerBrowserWebPush = (title: string, body: string, iconUrl?: string): boolean => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body,
        icon: iconUrl || '/favicon.ico',
        badge: '/favicon.ico',
        tag: `attendance-${Date.now()}`,
        requireInteraction: false
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
      return true;
    } catch (e) {
      console.warn('Could not display system notification:', e);
      return false;
    }
  }
  return false;
};

/**
 * Dispatch real-time in-app custom push event so UI banner pops up across all tabs
 */
export const dispatchInAppPushEvent = (payload: PushNotificationPayload, formatted: PushNotificationResult) => {
  if (typeof window === 'undefined') return;

  const event = new CustomEvent('minh_music_push_received', {
    detail: {
      id: `push-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      payload,
      formatted,
      receivedAt: new Date().toISOString()
    }
  });

  window.dispatchEvent(event);
};

/**
 * Main function to broadcast instant attendance push notification to parents
 */
export const sendInstantAttendancePush = (payload: PushNotificationPayload): PushNotificationResult => {
  const formatted = formatAttendancePushMessage(payload);

  // 1. Try Browser Web Push Notification
  triggerBrowserWebPush(formatted.title, formatted.shortSms);

  // 2. Dispatch In-App Push Event (banner popup with sound)
  dispatchInAppPushEvent(payload, formatted);

  return formatted;
};
