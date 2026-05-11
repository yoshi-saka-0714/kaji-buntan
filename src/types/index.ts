export interface User {
  id: string;
  name: string;
  pin: string;
  created_at: string;
}

export interface Task {
  id: string;
  name: string;
  points: number;
  created_at: string;
}

export interface Completion {
  id: string;
  user_id: string;
  task_id: string | null;
  task_name: string;
  points: number;
  completed_at: string;
}
