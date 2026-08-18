import { 
  BookOpen, 
  CalendarDays, 
  CreditCard, 
  Award, 
  User, 
  LayoutDashboard, 
  CheckSquare, 
  GraduationCap, 
  School, 
  DollarSign, 
  Sparkles, 
  Users, 
  FileText, 
  Clock, 
  RefreshCw, 
  Trophy, 
  Gift, 
  Settings, 
  ShieldCheck, 
  KeyRound, 
  Video, 
  Palmtree, 
  Palette, 
  MapPin, 
  Bell, 
  BarChart3, 
  FileSpreadsheet,
  Music,
  UserCheck
} from 'lucide-react';
import { UserRole } from '../types';

export interface SubMenuItem {
  id: string;
  label: string;
  shortLabel?: string;
  icon: any;
  badge?: number | string;
  description?: string;
}

export interface MainMenuItem {
  id: string;
  label: string;
  icon: any;
  subItems: SubMenuItem[];
  defaultSubId: string;
  color?: string;
}

// 1. STUDENT HIERARCHICAL NAVIGATION
export const STUDENT_NAV_CONFIG: MainMenuItem[] = [
  {
    id: 'learning',
    label: 'Học tập',
    icon: BookOpen,
    color: 'emerald',
    defaultSubId: 'overview_assignments',
    subItems: [
      {
        id: 'overview_assignments',
        label: 'Tổng Quan & Bài Tập',
        shortLabel: 'Tổng quan & Bài tập',
        icon: FileText,
        description: 'Tổng quan học tập và nộp bài tập cá nhân hóa 1-1'
      },
      {
        id: 'courses_registration',
        label: 'Môn Học & Đăng Ký',
        shortLabel: 'Môn học & Đăng ký',
        icon: BookOpen,
        description: 'Danh sách môn học đã đăng ký và đăng ký thêm môn mới'
      },
      {
        id: 'documents_library',
        label: 'Tài Liệu Học & Video',
        shortLabel: 'Tài liệu học',
        icon: Video,
        description: 'Kho giáo trình, video hướng dẫn và tài liệu thực hành'
      }
    ]
  },
  {
    id: 'schedule',
    label: 'Thời khóa biểu',
    icon: CalendarDays,
    color: 'indigo',
    defaultSubId: 'weekly_schedule',
    subItems: [
      {
        id: 'weekly_schedule',
        label: 'Lịch Tuần & Điểm Danh',
        shortLabel: 'Lịch tuần',
        icon: CalendarDays,
        description: 'Thời khóa biểu trong tuần và lịch sử điểm danh'
      },
      {
        id: 'makeup_schedule',
        label: 'Lịch Học Bù',
        shortLabel: 'Lịch học bù',
        icon: RefreshCw,
        description: 'Danh sách các buổi học bù và đăng ký học bù'
      },
      {
        id: 'leave_request',
        label: 'Đơn Nghỉ Phép & Bảo Lưu',
        shortLabel: 'Đơn nghỉ phép',
        icon: Clock,
        description: 'Gửi đơn xin nghỉ phép có lý do và bảo lưu khóa học'
      }
    ]
  },
  {
    id: 'tuition',
    label: 'Học phí',
    icon: CreditCard,
    color: 'amber',
    defaultSubId: 'pending_invoices',
    subItems: [
      {
        id: 'pending_invoices',
        label: 'Hóa Đơn Cần Đóng & VietQR',
        shortLabel: 'Hóa đơn cần đóng',
        icon: CreditCard,
        description: 'Tra cứu học phí cần đóng và quét mã VietQR tự động'
      },
      {
        id: 'payment_history',
        label: 'Lịch Sử Thanh Toán & Biên Lai',
        shortLabel: 'Lịch sử thanh toán',
        icon: FileSpreadsheet,
        description: 'Danh sách phiếu thu đã đóng và xác nhận biên lai chuyển khoản'
      }
    ]
  },
  {
    id: 'rewards',
    label: 'Đổi quà / Vinh danh',
    icon: Award,
    color: 'rose',
    defaultSubId: 'reward_store',
    subItems: [
      {
        id: 'reward_store',
        label: 'Đổi Thưởng & Kho Quà',
        shortLabel: 'Đổi thưởng',
        icon: Gift,
        description: 'Đổi sao/điểm thưởng lấy quà tặng nhạc cụ & phụ kiện'
      },
      {
        id: 'star_ranking',
        label: 'Bảng Xếp Hạng Top 3 Pro',
        shortLabel: 'Bảng xếp hạng',
        icon: Trophy,
        description: 'Vinh danh học viên xuất sắc và bục danh dự trung tâm'
      }
    ]
  },
  {
    id: 'account',
    label: 'Tài khoản',
    icon: User,
    color: 'slate',
    defaultSubId: 'profile_info',
    subItems: [
      {
        id: 'profile_info',
        label: 'Thông Tin Cá Nhân',
        shortLabel: 'Thông tin cá nhân',
        icon: User,
        description: 'Xem và chỉnh sửa hồ sơ học viên, thông tin liên hệ'
      },
      {
        id: 'settings',
        label: 'Cài Đặt & Cơ Sở',
        shortLabel: 'Cài đặt',
        icon: Settings,
        description: 'Tùy chỉnh giao diện sáng/tối và thông tin mạng lưới cơ sở'
      },
      {
        id: 'change_password',
        label: 'Đổi Mật Khẩu & Bảo Mật',
        shortLabel: 'Đổi mật khẩu',
        icon: KeyRound,
        description: 'Cập nhật mật khẩu bảo vệ tài khoản học viên'
      }
    ]
  }
];

// 2. PARENT HIERARCHICAL NAVIGATION (Tương đồng với Học viên nhưng nhấn mạnh vai trò Giám hộ)
export const PARENT_NAV_CONFIG: MainMenuItem[] = [
  {
    id: 'learning',
    label: 'Học tập của con',
    icon: BookOpen,
    color: 'emerald',
    defaultSubId: 'overview_assignments',
    subItems: [
      {
        id: 'overview_assignments',
        label: 'Tổng Quan & Bài Tập Của Con',
        shortLabel: 'Tổng quan & Bài tập',
        icon: FileText,
        description: 'Theo dõi tiến độ học tập và bài tập về nhà của con'
      },
      {
        id: 'courses_registration',
        label: 'Môn Học & Đăng Ký Mới',
        shortLabel: 'Môn học & Đăng ký',
        icon: BookOpen,
        description: 'Xem các khóa học của bé và đăng ký khóa học mới'
      },
      {
        id: 'documents_library',
        label: 'Tài Liệu & Video Học',
        shortLabel: 'Tài liệu học',
        icon: Video,
        description: 'Học liệu, sheet nhạc và video bài giảng bổ trợ'
      }
    ]
  },
  {
    id: 'schedule',
    label: 'Thời khóa biểu',
    icon: CalendarDays,
    color: 'indigo',
    defaultSubId: 'weekly_schedule',
    subItems: [
      {
        id: 'weekly_schedule',
        label: 'Lịch Học & Điểm Danh',
        shortLabel: 'Lịch tuần',
        icon: CalendarDays,
        description: 'Lịch học trong tuần và tình hình chuyên cần của con'
      },
      {
        id: 'makeup_schedule',
        label: 'Lịch Học Bù Của Bé',
        shortLabel: 'Lịch học bù',
        icon: RefreshCw,
        description: 'Xem lịch học bù đã xếp và gửi yêu cầu đăng ký học bù'
      },
      {
        id: 'leave_request',
        label: 'Đơn Nghỉ Phép & Bảo Lưu',
        shortLabel: 'Đơn nghỉ phép',
        icon: Clock,
        description: 'Phụ huynh gửi đơn xin nghỉ có phép hoặc bảo lưu học phí'
      }
    ]
  },
  {
    id: 'tuition',
    label: 'Học phí & VietQR',
    icon: CreditCard,
    color: 'amber',
    defaultSubId: 'pending_invoices',
    subItems: [
      {
        id: 'pending_invoices',
        label: 'Hóa Đơn Cần Đóng & Quét VietQR',
        shortLabel: 'Hóa đơn cần đóng',
        icon: CreditCard,
        description: 'Hóa đơn học phí của con và mã QR thanh toán nhanh'
      },
      {
        id: 'payment_history',
        label: 'Lịch Sử Đóng & Biên Lai',
        shortLabel: 'Lịch sử thanh toán',
        icon: FileSpreadsheet,
        description: 'Tra cứu phiếu thu và tải/gửi ảnh biên lai chuyển khoản'
      }
    ]
  },
  {
    id: 'rewards',
    label: 'Đổi quà / Vinh danh',
    icon: Award,
    color: 'rose',
    defaultSubId: 'reward_store',
    subItems: [
      {
        id: 'reward_store',
        label: 'Đổi Thưởng & Quà Tặng',
        shortLabel: 'Đổi thưởng',
        icon: Gift,
        description: 'Đổi điểm sao của con lấy quà tặng khích lệ học tập'
      },
      {
        id: 'star_ranking',
        label: 'Bảng Xếp Hạng & Huy Hiệu',
        shortLabel: 'Bảng xếp hạng',
        icon: Trophy,
        description: 'Xem bảng vinh danh và thành tích xuất sắc của con'
      }
    ]
  },
  {
    id: 'account',
    label: 'Tài khoản Phụ huynh',
    icon: User,
    color: 'slate',
    defaultSubId: 'profile_info',
    subItems: [
      {
        id: 'profile_info',
        label: 'Hồ Sơ & Liên Kết Con',
        shortLabel: 'Thông tin cá nhân',
        icon: User,
        description: 'Thông tin phụ huynh và danh sách các con đang liên kết'
      },
      {
        id: 'settings',
        label: 'Cài Đặt & Cơ Sở',
        shortLabel: 'Cài đặt',
        icon: Settings,
        description: 'Tùy chỉnh thông báo, giao diện và danh sách cơ sở'
      },
      {
        id: 'change_password',
        label: 'Đổi Mật Khẩu Phụ Huynh',
        shortLabel: 'Đổi mật khẩu',
        icon: KeyRound,
        description: 'Cập nhật mật khẩu bảo vệ tài khoản phụ huynh'
      }
    ]
  }
];

// 3. TEACHER HIERARCHICAL NAVIGATION
export const TEACHER_NAV_CONFIG: MainMenuItem[] = [
  {
    id: 'dashboard',
    label: 'Bàn giảng dạy',
    icon: LayoutDashboard,
    color: 'blue',
    defaultSubId: 'overview',
    subItems: [
      {
        id: 'overview',
        label: 'Tổng Quan Ca Dạy & Lớp Học',
        shortLabel: 'Tổng quan',
        icon: LayoutDashboard,
        description: 'Ca dạy hôm nay, điểm danh nhanh và học sinh sinh nhật'
      },
      {
        id: 'assignments_review',
        label: 'Chấm Bài Tập & Nhận Xét 1-1',
        shortLabel: 'Chấm bài tập',
        icon: FileText,
        description: 'Xem video thực hành học viên nộp và chấm điểm nhận xét'
      }
    ]
  },
  {
    id: 'attendance',
    label: 'Điểm danh lớp',
    icon: CheckSquare,
    color: 'emerald',
    defaultSubId: 'daily_check',
    subItems: [
      {
        id: 'daily_check',
        label: 'Điểm Danh Buổi Học & Cộng Sao',
        shortLabel: 'Điểm danh buổi học',
        icon: CheckSquare,
        description: 'Ghi nhận chuyên cần, đi muộn, nghỉ phép và khóa điểm'
      },
      {
        id: 'history',
        label: 'Lịch Sử Điểm Danh Lớp',
        shortLabel: 'Lịch sử điểm danh',
        icon: Clock,
        description: 'Tra cứu nhật ký điểm danh theo từng lớp học'
      }
    ]
  },
  {
    id: 'schedule',
    label: 'Lịch giảng dạy',
    icon: CalendarDays,
    color: 'indigo',
    defaultSubId: 'weekly_calendar',
    subItems: [
      {
        id: 'weekly_calendar',
        label: 'Thời Khóa Biểu Tuần',
        shortLabel: 'TKB Tuần',
        icon: CalendarDays,
        description: 'Lịch dạy các lớp theo ca sáng/chiều/tối'
      },
      {
        id: 'makeup_calendar',
        label: 'Lịch Dạy Bù & Ca Bổ Sung',
        shortLabel: 'Lịch dạy bù',
        icon: RefreshCw,
        description: 'Theo dõi ca dạy bù học viên bảo lưu hoặc xin bù'
      }
    ]
  },
  {
    id: 'classes',
    label: 'Lớp & Học viên',
    icon: Users,
    color: 'amber',
    defaultSubId: 'class_list',
    subItems: [
      {
        id: 'class_list',
        label: 'Danh Sách Lớp Phụ Trách',
        shortLabel: 'Danh sách lớp',
        icon: School,
        description: 'Thông tin phòng học, giáo trình và sĩ số lớp'
      },
      {
        id: 'student_progress',
        label: 'Tiến Độ Học Viên & Sao',
        shortLabel: 'Tiến độ học viên',
        icon: GraduationCap,
        description: 'Theo dõi độ tiến bộ, số sao và số buổi còn lại'
      }
    ]
  },
  {
    id: 'profile',
    label: 'Hồ sơ cá nhân',
    icon: UserCheck,
    color: 'slate',
    defaultSubId: 'profile_info',
    subItems: [
      {
        id: 'profile_info',
        label: 'Thông Tin Giảng Viên',
        shortLabel: 'Hồ sơ cá nhân',
        icon: UserCheck,
        description: 'Hồ sơ chuyên môn, môn giảng dạy và liên hệ'
      },
      {
        id: 'settings',
        label: 'Cài Đặt & Đổi Mật Khẩu',
        shortLabel: 'Cài đặt & Mật khẩu',
        icon: Settings,
        description: 'Đổi mật khẩu và cài đặt thông báo tài khoản giáo viên'
      }
    ]
  }
];

// Helper to find navigation tree based on role
export function getNavigationConfigByRole(role: UserRole): MainMenuItem[] {
  switch (role) {
    case 'STUDENT':
      return STUDENT_NAV_CONFIG;
    case 'PARENT':
    case 'GUARDIAN':
      return PARENT_NAV_CONFIG;
    case 'TEACHER':
      return TEACHER_NAV_CONFIG;
    default:
      return STUDENT_NAV_CONFIG;
  }
}

// Find main menu item and sub item metadata
export function findNavMatch(config: MainMenuItem[], mainId: string, subId?: string) {
  const main = config.find(m => m.id === mainId) || config[0];
  const sub = subId ? main.subItems.find(s => s.id === subId) : null;
  const activeSub = sub || main.subItems.find(s => s.id === main.defaultSubId) || main.subItems[0];
  return { main, activeSub };
}
