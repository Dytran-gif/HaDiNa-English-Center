// File: CourseTypes.ts
import type { ClassSchedule } from './ClassSchedule';

export type CourseLevel = 'All Levels' | 'Beginner' | 'Intermediate' | 'Advanced';
export type SkillRange ='Speaking' |'Reading' |'Listening' |'Writing' |'Vocabulary'|'Grammar'|'Pronunciation';
export interface Course {
    id: string;
    title: string;
    description: string;
    level: CourseLevel;
    imageUrl: string;
    durationHours: number;       
    studentCapacity: string;            
    price: number;
    timePerLesson: number;
    numberOfLessons: number;              
    skills: SkillRange[];
    // Danh sách các lớp học cụ thể để user chọn ở phần Bottom
    availableClasses: ClassSchedule[]; 
}

export interface CourseFilters {
    searchQuery: string;
    level: CourseLevel;
    skill: string;      
    courseType: string; 
}