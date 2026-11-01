import type { Teacher } from "../../../types/StudentTypes/MainTypes";

export const mockTeachers: Teacher[] = [
    { id: "tch-01", userId: "usr-04", fullName: "John Smith", phone: "0987654321", specialty: "Speaking & Communication", degree: "Master of TESOL", hireDate: "2024-08-15", status: "Active" },
    { id: "tch-02", userId: "usr-05", fullName: "Mary Johnson", phone: "0987654322", specialty: "IELTS Writing & Academic", degree: "Bachelor of Linguistics", hireDate: "2024-09-01", status: "Active" },
    { id: "tch-03", userId: "usr-09", fullName: "Robert Lee", phone: "0987654323", specialty: "Grammar & Vocabulary", degree: "CELTA Certificate", hireDate: "2024-10-10", status: "Active" },
    { id: "tch-04", userId: "usr-10", fullName: "Sarah Connor", phone: "0987654324", specialty: "Business English", degree: "MBA & TESOL", hireDate: "2024-11-01", status: "Active" },
    { id: "tch-05", userId: "usr-11", fullName: "David Beckham", phone: "0987654325", specialty: "Pronunciation & Phonetics", degree: "DELTA Certificate", hireDate: "2024-12-01", status: "Active" }
];