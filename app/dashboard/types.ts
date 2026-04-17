export type ViewType = "map" | "schools" | "teachers-bio" | "teachers-professional" | "qualifications" | "star-events";

export interface School {
  school_id: string;
  name: string;
  region: string;
  division: string;
  total_enrollment: number;
}

export interface TeacherBio {
  deped_id: string;
  school_id: string;
  first_name: string;
  last_name: string;
  sex: string;
  age: number;
  phone_number: string;
}

export interface TeacherProfessional {
  teacher_name: string;
  years_experience: number;
  teaching_level: string;
  role_position: string;
  specialization: string;
  is_internet_access: number;
  device_count: number;
}

export interface Qualification {
  teacher_name: string;
  cert_name: string;
  category: string;
  awarding_body: string;
  date_obtained: string;
}

export interface StarEvent {
  teacher_name: string;
  event_title: string;
  event_type: string;
  event_date: string;
}