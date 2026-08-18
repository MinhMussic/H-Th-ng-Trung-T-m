import { Student, UserAccount } from '../types';

/**
 * Interface cho thông tin quản lý vòng đời mã học viên
 */
export interface StudentCodeStatusInfo {
  code: string;
  isUsed: boolean;
  isLocked: boolean;
  isProtected: boolean;
  isReserved: boolean;
  assignedStudent?: Student;
  assignedAccount?: UserAccount;
}

/**
 * Tìm mã học viên khả dụng nhỏ nhất (HV001, HV002, HV003, ...)
 * Quy tắc nghiêm ngặt:
 * - Các mã của học viên đang học (active), đang bảo lưu (reserved), hoặc đang bị khóa/bảo vệ (locked)
 *   SẼ ĐƯỢC GIỮ NGUYÊN, không được phép tái sử dụng.
 * - Chỉ khi học viên cũ bị XÓA HOÀN TOÀN thì mã đó mới được giải phóng sạch sẽ
 *   để học viên mới có thể nhận và sử dụng lại từ đầu.
 */
export const getNextAvailableStudentCode = (
  students: Array<Partial<Student>> = [],
  accounts: Array<Partial<UserAccount>> = []
): string => {
  const occupiedNumbers = new Set<number>();

  // 1. Quét từ danh sách học viên hiện có
  (students || []).forEach(s => {
    if (s.code) {
      const match = s.code.match(/^HV(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > 0) {
          occupiedNumbers.add(num);
        }
      }
    }
  });

  // 2. Quét từ danh sách tài khoản người dùng đang hoạt động hoặc đang bị khóa (bảo vệ mã)
  (accounts || []).forEach(acc => {
    const code = acc.profileCode || (acc as any)?.code;
    if (code) {
      const match = code.match(/^HV(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > 0) {
          occupiedNumbers.add(num);
        }
      }
    }
  });

  // Tìm số nguyên dương nhỏ nhất chưa bị chiếm dụng
  let nextNum = 1;
  while (occupiedNumbers.has(nextNum)) {
    nextNum++;
  }

  return `HV${String(nextNum).padStart(3, '0')}`;
};

/**
 * Tạo mã học viên học thử khả dụng tiếp theo (HT001, HT002, ...)
 */
export const getNextTrialCode = (students: Array<Partial<Student>> = []): string => {
  const occupiedNumbers = new Set<number>();
  (students || []).forEach(s => {
    if (s.code) {
      const match = s.code.match(/^HT(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > 0) {
          occupiedNumbers.add(num);
        }
      }
    }
  });

  let nextNum = 1;
  while (occupiedNumbers.has(nextNum)) {
    nextNum++;
  }

  return `HT${String(nextNum).padStart(3, '0')}`;
};

/**
 * Kiểm tra xem mã học viên có đang bị khóa / bảo vệ không
 */
export const isStudentCodeProtectedOrLocked = (
  code: string,
  students: Student[] = [],
  accounts: UserAccount[] = []
): { isProtected: boolean; reason?: string } => {
  if (!code) return { isProtected: false };

  const cleanCode = code.trim().toUpperCase();

  // Kiểm tra trong danh sách học viên
  const matchedStudent = students.find(s => s.code?.trim().toUpperCase() === cleanCode);
  if (matchedStudent) {
    if (matchedStudent.status === 'locked') {
      return { isProtected: true, reason: `Mã ${cleanCode} đang bị Quản trị viên TẠM KHÓA.` };
    }
    if (matchedStudent.status === 'reserved') {
      return { isProtected: true, reason: `Mã ${cleanCode} đang trong thời gian BẢO LƯU.` };
    }
  }

  // Kiểm tra trong danh sách tài khoản
  const matchedAccount = accounts.find(
    a => (a.profileCode?.trim().toUpperCase() === cleanCode || (a as any)?.code?.trim().toUpperCase() === cleanCode)
  );
  if (matchedAccount) {
    if (matchedAccount.status === 'suspended') {
      return { isProtected: true, reason: `Tài khoản gắn với mã ${cleanCode} đang bị TẠM KHÓA.` };
    }
  }

  return { isProtected: false };
};

/**
 * Lấy danh sách thống kê toàn bộ mã học viên trong hệ thống (Đang dùng, Đang khóa, Khả dụng)
 */
export const getAllStudentCodesOverview = (
  students: Student[] = [],
  accounts: UserAccount[] = [],
  maxRange: number = 30
): StudentCodeStatusInfo[] => {
  const result: StudentCodeStatusInfo[] = [];

  for (let i = 1; i <= maxRange; i++) {
    const code = `HV${String(i).padStart(3, '0')}`;
    const assignedStudent = students.find(s => s.code?.trim().toUpperCase() === code);
    const assignedAccount = accounts.find(
      a => (a.profileCode?.trim().toUpperCase() === code || (a as any)?.code?.trim().toUpperCase() === code)
    );

    const isLocked = assignedStudent?.status === 'locked' || assignedAccount?.status === 'suspended';
    const isReserved = assignedStudent?.status === 'reserved';
    const isProtected = isLocked || isReserved;
    const isUsed = !!assignedStudent || !!assignedAccount;

    result.push({
      code,
      isUsed,
      isLocked: !!isLocked,
      isProtected,
      isReserved: !!isReserved,
      assignedStudent,
      assignedAccount
    });
  }

  return result;
};
