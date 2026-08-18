export type OverdueNoticeLevel = 'due_soon' | 'due_today' | 'overdue_level_1' | 'overdue_level_2';

export interface OverdueTemplate {
  id: string;
  level: OverdueNoticeLevel;
  name: string;
  description: string;
  emailSubject: string;
  emailBody: string;
  pushTitle: string;
  pushBody: string;
  smsBody: string;
  severity: 'info' | 'warning' | 'alert';
}

export interface OverdueAutomationSettings {
  isEnabled: boolean;
  scheduledTime: string; // e.g. "08:30"
  notifyBeforeDays: number; // e.g. 3 days before due
  notifyOnDueDate: boolean;
  repeatOverdueDays: number; // e.g. every 3 days
  enablePushInApp: boolean;
  enableEmail: boolean;
  enableSmsZalo: boolean;
  attachVietQr: boolean;
  autoSendParents: boolean;
  autoSendStudents: boolean;
  lastRunTimestamp?: string;
  totalAutomatedSent?: number;
}

export interface OverdueDispatchLog {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  guardianName?: string;
  paymentId: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  level: OverdueNoticeLevel;
  channels: ('push' | 'email' | 'sms')[];
  sentAt: string;
  status: 'success' | 'failed';
}
