export interface Task {
  id: string;
  areaId: string;
  name: string;
  priority: number; // 1 to 5
  completed: boolean;
  completedAt?: string; // ISO string date
  createdAt: string; // ISO string date
  parentId?: string; // New: Optional parent ID for sub-tasks
}

export interface Area {
  id: string;
  name: string;
  createdAt: string; // ISO string date
}