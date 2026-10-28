export interface Room {
  room_id: number;
  room_name: string;
  capacity: number;
  location: string;
}

export interface RoomAssignment {
  assignment_id: number;
  course_id: number;
  room_id: number;
}
