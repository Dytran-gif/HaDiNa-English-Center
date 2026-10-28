
export interface NotificationItem {
    id: string;
    iconType: 'feedback' | 'payment' | 'lesson' | 'schedule';
    title: string;
    description: string; // Bao gồm cả category và time. VD: "Speaking Practice • 2 hours ago"
}