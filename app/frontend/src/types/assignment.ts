export interface Assignment {
  assignment_id: number;
  course_id: number;
  title: string;
  description: string;
  due_date: string;
  created_at: string;
}

export type SubmissionStatus = "submitted" | "not_submitted" | "graded";

export interface Submission {
  submission_id: number;
  assignment_id: number;
  user_id: number;
  submitted_at?: string;
  status: SubmissionStatus;
  score?: number;
  feedback?: string;
}
