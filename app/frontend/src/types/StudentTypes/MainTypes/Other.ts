
export interface QuickAction {
    id: string;
    iconType: 'play' | 'document' | 'calendar' | 'book';
    label: string;
}
export interface FeatureItem {
    id: string;
    title: string;
    description: string;
    icon: string;
}