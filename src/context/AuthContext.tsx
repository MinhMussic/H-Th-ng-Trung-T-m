import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, UserAccount, AccountStatus, RegisterPayload } from '../types';
import { initialUserAccounts, initialStudents, initialGuardians, initialTeachers } from '../data/initialData';
import { auth, googleProvider } from '../firebase/config';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';

interface AuthContextType {
  currentUser: UserAccount | null;
  accounts: UserAccount[];
  role: UserRole; // Current active operational role
  currentRole: UserRole; // Alias for activeRole
  activeRole: UserRole; // Active operational role/mode
  activeMode: UserRole; // Alias for activeRole
  userRoles: UserRole[]; // All roles belonging to current user
  hasRole: (role: UserRole) => boolean;
  switchActiveRole: (role: UserRole) => void; // Switch mode without logout (e.g. Admin ↔ Teacher)
  isAuthenticated: boolean;
  loading: boolean;
  login: (emailOrUsername: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithEmail: (emailOrUsername: string, pass: string) => boolean | Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  register: (
    payloadOrEmail: RegisterPayload | string, 
    pass?: string, 
    displayName?: string, 
    phone?: string, 
    role?: 'STUDENT' | 'PARENT' | 'GUARDIAN' | 'TEACHER'
  ) => Promise<{ success: boolean; error?: string }>;
  registerUser: (
    payloadOrEmail: RegisterPayload | string, 
    pass?: string, 
    displayName?: string, 
    phone?: string, 
    role?: 'STUDENT' | 'PARENT' | 'GUARDIAN' | 'TEACHER'
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole, accountUid?: string) => void;
  switchRoleForTesting: (role: UserRole) => void;
  resetPassword: (emailOrIdentifier: string, newPassword?: string) => Promise<{ success: boolean; error?: string }>;
  findAccountByIdentifier: (identifier: string) => UserAccount | undefined;
  addAccount: (account: Omit<UserAccount, 'createdAt'>) => Promise<void>;
  updateAccountStatus: (uid: string, status: AccountStatus, note?: string) => void;
  updateAccountRole: (uid: string, role: UserRole, additionalRoles?: UserRole[]) => void;
  updateUserProfile: (updates: Partial<UserAccount>) => Promise<{ success: boolean; error?: string }>;
  linkAccountToProfile: (uid: string, profileId: string, profileName: string, profileCode: string) => void;
  deleteAccount: (uid: string) => void;
  factoryResetAccounts: (preserveAdminOnly?: boolean) => void;
  resetAccountsToDefault: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_ACCOUNTS_KEY = 'minhmusic_user_accounts_v2';
const LOCAL_STORAGE_CURRENT_USER_KEY = 'minhmusic_current_user_uid_v2';
const LOCAL_STORAGE_ACTIVE_ROLE_KEY = 'minhmusic_active_role_v2';

const ADMIN_EMAILS = [
  'minh123tho@gmail.com',
  'minhmusic1510@gmail.com',
  'admin@minhmusic.vn',
  'admin'
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_ACCOUNTS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge parsed accounts with initialUserAccounts to ensure all default accounts exist and have proper passwords & links
          const parsedMap = new Map<string, UserAccount>();
          parsed.forEach((acc: UserAccount) => {
            if (acc.uid) parsedMap.set(acc.uid, acc);
            if (acc.email) parsedMap.set(acc.email.toLowerCase(), acc);
            if (acc.username) parsedMap.set(acc.username.toLowerCase(), acc);
          });

          // Ensure all initialUserAccounts are present
          const merged: UserAccount[] = [...parsed];
          initialUserAccounts.forEach(initAcc => {
            const existing = parsed.find(
              p => p.uid === initAcc.uid ||
                   (p.email && initAcc.email && p.email.toLowerCase() === initAcc.email.toLowerCase()) ||
                   (p.username && initAcc.username && p.username.toLowerCase() === initAcc.username.toLowerCase()) ||
                   (p.studentProfileId && initAcc.studentProfileId && p.studentProfileId === initAcc.studentProfileId) ||
                   (p.guardianProfileId && initAcc.guardianProfileId && p.guardianProfileId === initAcc.guardianProfileId)
            );

            if (!existing) {
              merged.push(initAcc);
            } else {
              // Update missing fields like password or profileId
              if (!existing.password && initAcc.password) existing.password = initAcc.password;
              if (!existing.studentProfileId && initAcc.studentProfileId) existing.studentProfileId = initAcc.studentProfileId;
              if (!existing.guardianProfileId && initAcc.guardianProfileId) existing.guardianProfileId = initAcc.guardianProfileId;
              if (!existing.profileCode && initAcc.profileCode) existing.profileCode = initAcc.profileCode;
              if (!existing.roles && initAcc.roles) existing.roles = initAcc.roles;
              if (!existing.primaryRole && initAcc.primaryRole) existing.primaryRole = initAcc.primaryRole;
            }
          });

          return merged;
        }
      } catch (e) {
        console.error('Failed to parse accounts from storage', e);
      }
    }
    return initialUserAccounts;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const savedUid = localStorage.getItem(LOCAL_STORAGE_CURRENT_USER_KEY);
    if (savedUid) {
      const found = accounts.find(a => a.uid === savedUid);
      if (found && found.status === 'active') return found;
    }
    // Gating check: Default to null so the app always presents the public Login / Register screen first
    return null;
  });

  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem(LOCAL_STORAGE_ACTIVE_ROLE_KEY) as UserRole | null;
    const validRoles: UserRole[] = ['ADMIN', 'MANAGER', 'ACCOUNTANT', 'TEACHER', 'STUDENT', 'PARENT', 'GUARDIAN', 'admin', 'manager', 'accountant', 'teacher', 'student', 'parent', 'guardian'];
    if (savedRole && validRoles.includes(savedRole)) {
      return savedRole;
    }
    return currentUser?.primaryRole || currentUser?.role || 'ADMIN';
  });

  const [loading, setLoading] = useState<boolean>(true);

  // Sync active role when currentUser changes
  useEffect(() => {
    if (currentUser) {
      const userRoles = currentUser.roles || [currentUser.role];
      if (!userRoles.includes(activeRole)) {
        const defaultRole = currentUser.primaryRole || userRoles[0] || 'STUDENT';
        setActiveRole(defaultRole);
        localStorage.setItem(LOCAL_STORAGE_ACTIVE_ROLE_KEY, defaultRole);
      }
    }
  }, [currentUser]);

  // Sync accounts to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
  }, [accounts]);

  // Sync current user UID
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_KEY, currentUser.uid);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER_KEY);
    }
  }, [currentUser]);

  // Sync active role to storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_ACTIVE_ROLE_KEY, activeRole);
  }, [activeRole]);

  // Multi-role helpers
  const userRoles = currentUser?.roles && currentUser.roles.length > 0 
    ? currentUser.roles 
    : currentUser ? [currentUser.role] : [];

  const hasRole = (r: UserRole) => userRoles.includes(r);

  const switchActiveRole = (targetRole: UserRole) => {
    if (!currentUser) return;
    const allowedRoles = currentUser.roles || [currentUser.role];
    if (allowedRoles.includes(targetRole)) {
      setActiveRole(targetRole);
      const updated = { ...currentUser, activeRole: targetRole };
      setCurrentUser(updated);
      setAccounts(prev => prev.map(a => a.uid === currentUser.uid ? updated : a));
    } else {
      console.warn(`User does not have role ${targetRole}`);
    }
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    let isMounted = true;
    try {
      const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        if (!isMounted) return;
        if (fbUser) {
          // Find matching account by email or UID
          const matched = accounts.find(a => a.email.toLowerCase() === fbUser.email?.toLowerCase() || a.uid === fbUser.uid);
          if (matched) {
            setCurrentUser(matched);
          } else {
            // New user from Google/Firebase
            const isDefaultAdmin = ADMIN_EMAILS.includes(fbUser.email?.toLowerCase() || '');
            const newAcc: UserAccount = {
              uid: fbUser.uid,
              email: fbUser.email || 'user@minhmusic.vn',
              username: (fbUser.email?.split('@')[0] || 'user').toLowerCase(),
              displayName: fbUser.displayName || fbUser.email?.split('@')[0] || (isDefaultAdmin ? 'Thầy Nguyễn Văn Minh (Admin)' : 'Người dùng mới'),
              role: isDefaultAdmin ? 'ADMIN' : 'STUDENT',
              roles: isDefaultAdmin ? ['ADMIN', 'TEACHER'] : ['STUDENT'],
              primaryRole: isDefaultAdmin ? 'ADMIN' : 'STUDENT',
              status: isDefaultAdmin ? 'active' : 'pending',
              avatarUrl: fbUser.photoURL || undefined,
              createdAt: new Date().toISOString().split('T')[0],
              lastLoginAt: 'Vừa xong'
            };
            setAccounts(prev => [newAcc, ...prev]);
            setCurrentUser(newAcc);
          }
        }
        setLoading(false);
      });

      return () => {
        isMounted = false;
        unsubscribe();
      };
    } catch (err) {
      console.warn('Firebase Auth listener initialization notice:', err);
      setLoading(false);
    }
  }, []);

  const login = async (emailOrUsername: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const rawInput = (emailOrUsername || '').trim();
    const query = rawInput.toLowerCase();
    const cleanPhone = query.replace(/[\s.\-+()]+/g, '');
    const cleanCode = query.replace(/[\s\-_]+/g, '');
    const cleanPassword = (pass || '').trim();

    // 1. Search in existing accounts
    let found = accounts.find(a => {
      const aEmail = (a.email || '').toLowerCase();
      const aUsername = (a.username || '').toLowerCase();
      const aPhone = (a.phone || '').replace(/[\s.\-+()]+/g, '');
      const aProfileCode = (a.profileCode || '').toLowerCase().replace(/[\s\-_]+/g, '');
      const aProfileId = (a.profileId || '').toLowerCase().replace(/[\s\-_]+/g, '');
      const aStudentId = (a.studentProfileId || '').toLowerCase().replace(/[\s\-_]+/g, '');
      const aGuardianId = (a.guardianProfileId || '').toLowerCase().replace(/[\s\-_]+/g, '');
      const aTeacherId = (a.teacherProfileId || '').toLowerCase().replace(/[\s\-_]+/g, '');

      return (
        aEmail === query ||
        aUsername === query ||
        (cleanPhone.length >= 8 && aPhone.includes(cleanPhone)) ||
        (cleanCode && aProfileCode === cleanCode) ||
        (cleanCode && aProfileId === cleanCode) ||
        (cleanCode && aStudentId === cleanCode) ||
        (cleanCode && aGuardianId === cleanCode) ||
        (cleanCode && aTeacherId === cleanCode)
      );
    });

    // 2. Check initialUserAccounts fallback
    if (!found) {
      const initMatch = initialUserAccounts.find(ia => {
        const iEmail = (ia.email || '').toLowerCase();
        const iUsername = (ia.username || '').toLowerCase();
        const iPhone = (ia.phone || '').replace(/[\s.\-+()]+/g, '');
        const iProfileCode = (ia.profileCode || '').toLowerCase().replace(/[\s\-_]+/g, '');
        const iStudentId = (ia.studentProfileId || '').toLowerCase().replace(/[\s\-_]+/g, '');
        const iGuardianId = (ia.guardianProfileId || '').toLowerCase().replace(/[\s\-_]+/g, '');
        
        return (
          iEmail === query ||
          iUsername === query ||
          (cleanPhone.length >= 8 && iPhone.includes(cleanPhone)) ||
          (cleanCode && iProfileCode === cleanCode) ||
          (cleanCode && iStudentId === cleanCode) ||
          (cleanCode && iGuardianId === cleanCode)
        );
      });

      if (initMatch) {
        found = { ...initMatch };
        setAccounts(prev => [found!, ...prev.filter(a => a.uid !== found!.uid)]);
      }
    }

    // 3. Fallback: Search in initialStudents by code, phone, or email
    if (!found) {
      const matchedStudent = initialStudents.find(s => {
        const sCode = s.code.toLowerCase().replace(/[\s\-_]+/g, '');
        const sPhone = (s.phone || '').replace(/[\s.\-+()]+/g, '');
        const sEmail = (s.email || '').toLowerCase();
        const sId = s.id.toLowerCase().replace(/[\s\-_]+/g, '');
        return sCode === cleanCode || sId === cleanCode || (cleanPhone.length >= 8 && sPhone.includes(cleanPhone)) || sEmail === query;
      });

      if (matchedStudent) {
        found = {
          uid: `usr-student-${matchedStudent.id}`,
          email: matchedStudent.email || `${matchedStudent.code.toLowerCase()}@minhmusic.vn`,
          username: matchedStudent.code.toLowerCase(),
          password: 'student123',
          displayName: matchedStudent.fullName,
          phone: matchedStudent.phone,
          role: 'STUDENT',
          roles: ['STUDENT'],
          primaryRole: 'STUDENT',
          status: 'active',
          profileId: matchedStudent.id,
          studentProfileId: matchedStudent.id,
          profileCode: matchedStudent.code,
          profileName: matchedStudent.fullName,
          avatarUrl: matchedStudent.avatar,
          createdAt: matchedStudent.joinDate || '2024-01-01',
          lastLoginAt: 'Vừa xong'
        };
        setAccounts(prev => [found!, ...prev]);
      }
    }

    // 4. Fallback: Search in initialGuardians by code, phone, or email
    if (!found) {
      const matchedGuardian = initialGuardians.find(g => {
        const gCode = g.code.toLowerCase().replace(/[\s\-_]+/g, '');
        const gPhone = (g.phone || '').replace(/[\s.\-+()]+/g, '');
        const gEmail = (g.email || '').toLowerCase();
        const gId = g.id.toLowerCase().replace(/[\s\-_]+/g, '');
        return gCode === cleanCode || gId === cleanCode || (cleanPhone.length >= 8 && gPhone.includes(cleanPhone)) || gEmail === query;
      });

      if (matchedGuardian) {
        found = {
          uid: `usr-parent-${matchedGuardian.id}`,
          email: matchedGuardian.email || `${matchedGuardian.code.toLowerCase()}@minhmusic.vn`,
          username: matchedGuardian.code.toLowerCase(),
          password: 'parent123',
          displayName: `${matchedGuardian.fullName} (PH)`,
          phone: matchedGuardian.phone,
          role: 'PARENT',
          roles: ['PARENT'],
          primaryRole: 'PARENT',
          status: 'active',
          profileId: matchedGuardian.id,
          guardianProfileId: matchedGuardian.id,
          profileCode: matchedGuardian.code,
          profileName: matchedGuardian.fullName,
          createdAt: matchedGuardian.createdAt || '2024-01-01',
          lastLoginAt: 'Vừa xong'
        };
        setAccounts(prev => [found!, ...prev]);
      }
    }

    // 5. Auto-create/restore admin if logging in with designated admin email
    if (!found && ADMIN_EMAILS.includes(query)) {
      found = {
        uid: 'usr-admin-main',
        email: query.includes('@') ? query : 'Minh123tho@gmail.com',
        username: query.includes('@') ? query.split('@')[0] : 'admin',
        password: 'admin123',
        displayName: 'Thầy Nguyễn Văn Minh (Admin)',
        phone: '0908151088',
        role: 'ADMIN',
        roles: ['ADMIN', 'TEACHER'],
        primaryRole: 'ADMIN',
        status: 'active',
        profileCode: 'ADMIN01',
        profileName: 'Thầy Nguyễn Văn Minh (Admin)',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: '2024-01-01',
        lastLoginAt: 'Vừa xong',
        note: 'Tài khoản Quản trị viên cấp cao & Giảng viên chính'
      };
      setAccounts(prev => [found!, ...prev]);
    }

    if (!found) {
      return { success: false, error: 'Không tìm thấy tài khoản với Email, Tên đăng nhập, SĐT hoặc Mã học viên/phụ huynh này.' };
    }

    // Auto-activate pending accounts if they are linked to a profile or belong to students/parents
    if (found.status === 'pending') {
      if (found.studentProfileId || found.guardianProfileId || found.teacherProfileId || found.role === 'STUDENT' || found.role === 'PARENT') {
        found = { ...found, status: 'active' };
      } else {
        return { 
          success: false, 
          error: 'Tài khoản của bạn đang trong trạng thái Chờ Quản trị viên (Admin) phê duyệt. Vui lòng liên hệ trung tâm hoặc đợi kích hoạt.' 
        };
      }
    }

    if (found.status === 'suspended') {
      return { success: false, error: 'Tài khoản này đã bị tạm khóa. Vui lòng liên hệ Quản trị viên.' };
    }

    if (found.status === 'rejected') {
      return { success: false, error: 'Tài khoản đăng ký đã bị từ chối bởi Quản trị viên.' };
    }

    // Password Verification: Accept set password OR role defaults OR phone OR student code
    const validPasswords = [
      found.password,
      '123456',
      'minhmusic',
      found.phone?.replace(/[\s.\-+()]+/g, ''),
      found.profileCode,
      found.profileCode?.toLowerCase(),
      found.role === 'ADMIN' ? 'admin123' : null,
      found.role === 'TEACHER' ? 'teacher123' : null,
      found.role === 'STUDENT' ? 'student123' : null,
      found.role === 'PARENT' || found.role === 'GUARDIAN' ? 'parent123' : null,
      found.role === 'MANAGER' ? 'manager123' : null,
      found.role === 'ACCOUNTANT' ? 'accountant123' : null
    ].filter(Boolean) as string[];

    const isPasswordValid = validPasswords.some(p => p.toLowerCase() === cleanPassword.toLowerCase());

    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Mật khẩu không chính xác. (Mặc định: student123 cho Học viên, parent123 cho Phụ huynh, hoặc 123456)'
      };
    }

    // Try real Firebase Auth if configured
    try {
      if (cleanPassword.length >= 6 && found.email && found.email.includes('@')) {
        await signInWithEmailAndPassword(auth, found.email, cleanPassword);
      }
    } catch (fbErr: any) {
      console.log('Firebase Email/Pass sign-in fallback:', fbErr.message);
    }

    // Update lastLoginAt
    const updated = { ...found, status: 'active' as AccountStatus, lastLoginAt: 'Vừa xong' };
    setAccounts(prev => prev.map(a => a.uid === found!.uid ? updated : a));
    setCurrentUser(updated);
    const initialActiveRole = updated.primaryRole || updated.role || 'STUDENT';
    setActiveRole(initialActiveRole);
    return { success: true };
  };

  const loginWithEmail = async (emailOrUsername: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    return await login(emailOrUsername, pass);
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const matched = accounts.find(a => a.email.toLowerCase() === fbUser.email?.toLowerCase());
      if (matched) {
        if (matched.status === 'suspended') {
          return { success: false, error: 'Tài khoản đã bị tạm khóa.' };
        }
        if (matched.status === 'pending') {
          return { success: false, error: 'Tài khoản Google của bạn đang chờ Admin duyệt kích hoạt.' };
        }
        const updated = { ...matched, lastLoginAt: 'Vừa xong' };
        setCurrentUser(updated);
        return { success: true };
      } else {
        const isAdmin = ADMIN_EMAILS.includes(fbUser.email?.toLowerCase() || '');
        const newAcc: UserAccount = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          username: (fbUser.email?.split('@')[0] || 'google_user').toLowerCase(),
          displayName: fbUser.displayName || (isAdmin ? 'Thầy Nguyễn Văn Minh (Admin)' : 'Người dùng Google'),
          role: isAdmin ? 'ADMIN' : 'STUDENT',
          roles: isAdmin ? ['ADMIN', 'TEACHER'] : ['STUDENT'],
          primaryRole: isAdmin ? 'ADMIN' : 'STUDENT',
          status: isAdmin ? 'active' : 'pending',
          avatarUrl: fbUser.photoURL || undefined,
          createdAt: new Date().toISOString().split('T')[0],
          lastLoginAt: 'Vừa xong',
          note: isAdmin ? 'Quản trị viên cấp cao hệ thống' : 'Đăng nhập lần đầu qua Google'
        };
        setAccounts(prev => [newAcc, ...prev]);
        if (isAdmin) {
          setCurrentUser(newAcc);
        }
        return { success: true };
      }
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      return { success: false, error: err.message || 'Không thể đăng nhập bằng Google. Vui lòng thử lại.' };
    }
  };

  const register = async (
    payloadOrEmail: RegisterPayload | string,
    pass?: string,
    displayName?: string,
    phone?: string,
    role?: 'STUDENT' | 'PARENT' | 'GUARDIAN' | 'TEACHER'
  ): Promise<{ success: boolean; error?: string }> => {
    let regData: RegisterPayload;
    if (typeof payloadOrEmail === 'object') {
      regData = payloadOrEmail;
    } else {
      regData = {
        email: payloadOrEmail,
        password: pass || '',
        displayName: displayName || '',
        phone: phone || '',
        role: role || 'STUDENT',
        username: payloadOrEmail.split('@')[0]
      };
    }

    const trimmedEmail = (regData.email || '').trim().toLowerCase();
    const trimmedUsername = (regData.username || '').trim().toLowerCase();

    // Security check: Never allow ADMIN self registration
    if (regData.role === ('ADMIN' as any)) {
      return { success: false, error: 'Không được phép tự đăng ký tài khoản Quản trị viên.' };
    }

    // Check existing email
    if (accounts.some(a => a.email.toLowerCase() === trimmedEmail)) {
      return { success: false, error: 'Email này đã được sử dụng trong hệ thống.' };
    }

    // Check existing username
    if (trimmedUsername && accounts.some(a => a.username && a.username.toLowerCase() === trimmedUsername)) {
      return { success: false, error: 'Tên đăng nhập này đã có người sử dụng. Vui lòng chọn tên đăng nhập khác.' };
    }

    let uid = `usr-reg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    try {
      const fbCred = await createUserWithEmailAndPassword(auth, trimmedEmail, regData.password);
      if (fbCred?.user?.uid) {
        uid = fbCred.user.uid;
      }
    } catch (fbErr: any) {
      console.log('Firebase signup notice:', fbErr.message);
    }

    const newAccount: UserAccount = {
      uid,
      email: trimmedEmail,
      username: trimmedUsername || trimmedEmail.split('@')[0],
      password: regData.password,
      displayName: regData.displayName,
      nickname: regData.nickname,
      phone: regData.phone,
      role: regData.role,
      roles: [regData.role],
      primaryRole: regData.role,
      activeRole: regData.role,
      status: 'pending', // Pending Admin approval
      birthDate: regData.birthDate,
      nationality: regData.nationality || 'Việt Nam',
      ethnicity: regData.ethnicity || 'Kinh',
      address: regData.address,
      guardianName: regData.guardianName,
      guardianPhone: regData.guardianPhone,
      guardianRelation: regData.guardianRelation,
      guardianBirthYear: regData.guardianBirthYear,
      isUnder16: regData.isUnder16,
      specialties: regData.specialties,
      createdAt: new Date().toISOString().split('T')[0],
      note: regData.note || `Đăng ký vai trò ${regData.role}. Đang chờ Admin duyệt & kích hoạt vào app.`
    };

    setAccounts(prev => [newAccount, ...prev]);
    // Important: Account is in pending status, wait for Admin approval
    return { success: true };
  };

  const registerUser = register;

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Sign out error:', e);
    }
    setCurrentUser(null);
  };

  const switchRole = (targetRole: UserRole, accountUid?: string) => {
    if (accountUid) {
      const found = accounts.find(a => a.uid === accountUid);
      if (found) {
        setCurrentUser(found);
        setActiveRole(found.primaryRole || found.role);
        return;
      }
    }
    // Find first active account with requested role
    const matched = accounts.find(a => (a.roles?.includes(targetRole) || a.role === targetRole) && a.status === 'active') 
      || accounts.find(a => a.roles?.includes(targetRole) || a.role === targetRole);
    
    if (matched) {
      setCurrentUser(matched);
      setActiveRole(targetRole);
    }
  };

  const switchRoleForTesting = (r: UserRole) => {
    switchRole(r);
  };

  const findAccountByIdentifier = (identifier: string): UserAccount | undefined => {
    const q = identifier.trim().toLowerCase();
    const cleanPhone = q.replace(/[\s.\-+()]+/g, '');
    const cleanCode = q.replace(/[\s\-_]+/g, '');
    return accounts.find(a => 
      a.email.toLowerCase() === q ||
      (a.username && a.username.toLowerCase() === q) ||
      (cleanPhone.length >= 8 && a.phone && a.phone.replace(/[\s.\-+()]+/g, '').includes(cleanPhone)) ||
      (cleanCode && a.profileCode && a.profileCode.toLowerCase().replace(/[\s\-_]+/g, '') === cleanCode) ||
      (cleanCode && a.profileId && a.profileId.toLowerCase().replace(/[\s\-_]+/g, '') === cleanCode) ||
      (cleanCode && a.studentProfileId && a.studentProfileId.toLowerCase().replace(/[\s\-_]+/g, '') === cleanCode) ||
      (cleanCode && a.guardianProfileId && a.guardianProfileId.toLowerCase().replace(/[\s\-_]+/g, '') === cleanCode)
    );
  };

  const resetPassword = async (emailOrIdentifier: string, newPassword?: string): Promise<{ success: boolean; error?: string }> => {
    const targetAccount = findAccountByIdentifier(emailOrIdentifier);

    if (newPassword) {
      if (!targetAccount) {
        return { success: false, error: 'Không tìm thấy tài khoản với thông tin đã cung cấp.' };
      }
      if (newPassword.length < 6) {
        return { success: false, error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' };
      }

      // Update in local accounts list
      setAccounts(prev => prev.map(a => a.uid === targetAccount.uid ? { ...a, password: newPassword } : a));
      
      // Also update currentUser if it happens to be logged in
      if (currentUser?.uid === targetAccount.uid) {
        setCurrentUser(prev => prev ? { ...prev, password: newPassword } : null);
      }

      // Attempt Firebase password reset if possible
      try {
        if (targetAccount.email && targetAccount.email.includes('@')) {
          sendPasswordResetEmail(auth, targetAccount.email).catch(() => {});
        }
      } catch (e) {
        // Silently ignore firebase err
      }

      return { success: true };
    }

    // Default to sending reset email
    const emailToSend = targetAccount ? targetAccount.email : emailOrIdentifier;
    if (!emailToSend || !emailToSend.includes('@')) {
      return { success: false, error: 'Địa chỉ email không hợp lệ.' };
    }

    try {
      await sendPasswordResetEmail(auth, emailToSend);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Không thể gửi email đặt lại mật khẩu.' };
    }
  };

  const addAccount = async (accountData: Omit<UserAccount, 'createdAt'>) => {
    const newAcc: UserAccount = {
      ...accountData,
      password: accountData.password || (accountData.role === 'ADMIN' ? 'admin123' : accountData.role === 'TEACHER' ? 'teacher123' : accountData.role === 'STUDENT' ? 'student123' : 'parent123'),
      roles: accountData.roles || [accountData.role],
      primaryRole: accountData.primaryRole || accountData.role,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setAccounts(prev => [newAcc, ...prev]);
  };

  const updateAccountStatus = (uid: string, status: AccountStatus, note?: string) => {
    setAccounts(prev => prev.map(a => {
      if (a.uid === uid) {
        return { 
          ...a, 
          status, 
          note: note !== undefined ? note : a.note 
        };
      }
      return a;
    }));

    if (currentUser?.uid === uid) {
      setCurrentUser(prev => prev ? { ...prev, status, note: note !== undefined ? note : prev.note } : null);
    }
  };

  const updateAccountRole = (uid: string, roleToSet: UserRole, additionalRoles?: UserRole[]) => {
    const updatedRoles = additionalRoles ? Array.from(new Set([roleToSet, ...additionalRoles])) : [roleToSet];
    setAccounts(prev => prev.map(a => a.uid === uid ? { 
      ...a, 
      role: roleToSet,
      roles: updatedRoles,
      primaryRole: roleToSet
    } : a));
    if (currentUser?.uid === uid) {
      setCurrentUser(prev => prev ? { 
        ...prev, 
        role: roleToSet,
        roles: updatedRoles,
        primaryRole: roleToSet
      } : null);
    }
  };

  const updateUserProfile = async (updates: Partial<UserAccount>): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Chưa đăng nhập.' };
    }

    const updatedUser: UserAccount = {
      ...currentUser,
      ...updates
    };

    setCurrentUser(updatedUser);
    setAccounts(prev => prev.map(a => a.uid === currentUser.uid ? updatedUser : a));

    return { success: true };
  };

  const linkAccountToProfile = (uid: string, profileId: string, profileName: string, profileCode: string) => {
    setAccounts(prev => prev.map(a => {
      if (a.uid === uid) {
        return {
          ...a,
          profileId,
          profileName,
          profileCode,
          status: 'active'
        };
      }
      return a;
    }));
  };

  const deleteAccount = (uid: string) => {
    setAccounts(prev => prev.filter(a => a.uid !== uid));
    if (currentUser?.uid === uid) {
      const remainingAdmin = accounts.find(a => a.role === 'ADMIN' && a.uid !== uid);
      setCurrentUser(remainingAdmin || null);
    }
  };

  const factoryResetAccounts = (preserveAdminOnly: boolean = true) => {
    if (preserveAdminOnly) {
      // Keep only administrator accounts, clean any orphaned teacher/student profile links
      const adminAccounts = accounts
        .filter(a => a.role === 'ADMIN' || a.roles?.includes('ADMIN'))
        .map(a => ({
          ...a,
          profileId: undefined,
          studentProfileId: undefined,
          teacherProfileId: undefined,
          guardianProfileId: undefined
        }));
      
      const finalAdmins = adminAccounts.length > 0 ? adminAccounts : initialUserAccounts.filter(a => a.role === 'ADMIN');
      setAccounts(finalAdmins);
      localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(finalAdmins));
      
      if (currentUser && !finalAdmins.some(a => a.uid === currentUser.uid)) {
        setCurrentUser(finalAdmins[0] || null);
      }
    } else {
      setAccounts([]);
      localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify([]));
      setCurrentUser(null);
    }
  };

  const resetAccountsToDefault = () => {
    setAccounts(initialUserAccounts);
    localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(initialUserAccounts));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        accounts,
        role: activeRole,
        currentRole: activeRole,
        activeRole,
        activeMode: activeRole,
        userRoles,
        hasRole,
        switchActiveRole,
        isAuthenticated: !!currentUser,
        loading,
        login,
        loginWithEmail,
        loginWithGoogle,
        register,
        registerUser,
        logout,
        switchRole,
        switchRoleForTesting,
        resetPassword,
        findAccountByIdentifier,
        addAccount,
        updateAccountStatus,
        updateAccountRole,
        updateUserProfile,
        linkAccountToProfile,
        deleteAccount,
        factoryResetAccounts,
        resetAccountsToDefault
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

