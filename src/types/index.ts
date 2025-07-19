export interface HourlyResponse {
  id: string;
  timestamp: string;
  response: string;
}

export interface Area {
  id: string;
  name: string;
  created_at: string;
}

export interface Task {
  id: string;
  area_id: string;
  name: string;
  priority: number;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  parent_id?: string;
}