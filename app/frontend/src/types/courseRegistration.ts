export interface CourseRegistration {
  id: number; studentId: number; studentCode: string; studentName: string;
  courseId: number; courseName: string; status: "Pending" | "Assigned" | "Cancelled";
  createdAt: string; classId: number | null; className: string | null; assignedAt: string | null;
}
