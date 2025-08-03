export interface Task {
  id: string;
  area_id: string; // Changed to snake_case
  name: string;
  priority: number; // 1 to 5
  completed: boolean;
  completed_at?: string; // Changed to snake_case (ISO string date)
  created_at: string; // Changed to snake_case (ISO string date)
  parent_id?: string; // Changed to snake_case: Optional parent ID for sub-tasks
}

export interface Area {
  id: string;
  name: string;
  created_at: string; // Changed to snake_case (ISO string date)
}

export interface HourlyResponse {
  id: string;
  timestamp: string; // ISO string date
  response: string;
}