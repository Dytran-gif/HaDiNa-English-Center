export interface ClassSchedule {
    classId: string;           // VD: "SPE-B1-02"
    scheduleTime: string;      // VD: "Tue & Thu | 18:00 - 19:30"
    center: string;            // VD: "Center B"
    maxCapacity: number;       // Tối đa bao nhiêu người (VD: 15)
    currentEnrolled: number;   // Hiện tại đã có bao nhiêu người đăng ký (VD: 12)
}