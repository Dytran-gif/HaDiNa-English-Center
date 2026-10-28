import type { Room, RoomAssignment } from "../../types";

// Mock dữ liệu phòng học — chưa có backend thật.
export const adminRooms: Room[] = [
    { room_id: 1, room_name: "Phòng A101", capacity: 20, location: "Tầng 1 - Cơ sở Bình Thạnh" },
    { room_id: 2, room_name: "Phòng A102", capacity: 15, location: "Tầng 1 - Cơ sở Bình Thạnh" },
    { room_id: 3, room_name: "Phòng B201", capacity: 25, location: "Tầng 2 - Cơ sở Bình Thạnh" },
    { room_id: 4, room_name: "Phòng Online Studio", capacity: 40, location: "Trực tuyến" },
];

// Gán phòng học cho từng khóa học (mock — mỗi khóa 1 phòng cố định để đơn giản hóa demo).
export const adminRoomAssignments: RoomAssignment[] = [
    { assignment_id: 1, course_id: 1, room_id: 1 },
    { assignment_id: 2, course_id: 2, room_id: 4 },
    { assignment_id: 3, course_id: 3, room_id: 4 },
    { assignment_id: 4, course_id: 4, room_id: 2 },
    { assignment_id: 5, course_id: 5, room_id: 3 },
    { assignment_id: 6, course_id: 6, room_id: 2 },
];
