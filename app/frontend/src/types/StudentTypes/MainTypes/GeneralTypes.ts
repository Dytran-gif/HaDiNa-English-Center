// 1. Bảng Courses
export interface Course {
    id: string;
    name: string;
    description: string;
    bandFrom: string;
    bandTo: string;
    totalSessions: number;
    sessionsPerWeek: number;
    tuition: number;
    discountPercent: number;
    imageUrl?: string; 
    createdAt?: string;
    availableClasses?: ClassItem[];
}

// 2. Bảng Classes
export interface ClassItem {
    id: string;
    courseId: string;
    teacherId?: string;
    name: string;
    startDate: string;
    endDate?: string;
    maxStudents: number;
    meetingUrl?: string;
    // Relations / Computed
    schedules: ClassScheduleItem[];
    currentEnrolled?: number;
}

// 3. Bảng ClassSchedule
export interface ClassScheduleItem {
    id: string;
    classId: string;
    roomId?: string;
    dayOfWeek: string; // 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
    startTime: string; // "08:30"
    endTime: string;   // "11:30"
}

// 4. Bảng Enrollment
export interface Enrollment {
    id: string;
    studentId: string;
    classId: string;
    tuitionFee: number;
    discountPercent: number;
    discountAmount: number;
    finalTuitionFee: number;
    status: 'Pending' | 'Active' | 'Completed' | 'Cancelled';
    createdAt?: string;
}

// 5. Bảng Payments
export interface Payment {
    id: string;
    enrollmentId: string;
    createdByUserId: string;
    amount: number;
    method: 'Cash' | 'Banking' | 'CreditCard';
    paidDate: string;
    note?: string;
    createdAt?: string;
}

// 6. Bảng Room
export interface Room {
    id: string;
    name: string;
    capacity: number;
}

// 7. Bảng Students
export interface Student {
    id: string;
    userId: string;
    code: string;
    fullName: string;
    dateOfBirth?: string;
    phone?: string;
    address?: string;
    parentName?: string;
    parentPhone?: string;
    status: string;
    createdAt?: string;
}

// 8. Bảng Teacher
export interface Teacher {
    id: string;
    userId: string;
    fullName: string;
    phone?: string;
    specialty?: string;
    degree?: string;
    hireDate?: string;
    status: string;
}

// 9. Bảng User
export interface User {
    id: string;
    email: string;
    passwordHash?: string;
    role: 'Admin' | 'Student' | 'Teacher';
    avatarUrl?: string;
    isLocked: boolean;
    createdAt?: string;
}
// 10 bảng thông báo
export interface AppNotification {
    id: string;
    classId?: string;
    title: string;
    message: string;
    noticeDate?: string; // YYYY-MM-DD
    type: 'Cancellation' | 'ScheduleChange' | 'General';
    createdAt?: string;
}