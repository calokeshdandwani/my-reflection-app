import { supabase } from "./supabaseClient";
import { Area, Task, HourlyResponse } from "@/types";
import { toast } from "sonner"; // Import toast for notifications

// Generic function to fetch data from Supabase
export const loadSupabaseData = async <T>(
  tableName: string,
  orderByColumn: string = "created_at",
  ascending: boolean = true,
): Promise<T[] | undefined> => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .order(orderByColumn, { ascending });

    if (error) {
      console.error(`Error loading data from ${tableName}:`, error);
      toast.error(`Failed to load ${tableName}: ${error.message}`); // Show Supabase error
      return undefined;
    }
    return data as T[];
  } catch (error: any) { // Catch unexpected errors
    console.error(`Unexpected error loading data from ${tableName}:`, error);
    toast.error(`An unexpected error occurred while loading ${tableName}: ${error.message}`);
    return undefined;
  }
};

// Generic function to save data to Supabase
export const saveSupabaseData = async <T>(
  tableName: string,
  data: T,
): Promise<T | undefined> => {
  try {
    const { data: savedData, error } = await supabase
      .from(tableName)
      .insert(data)
      .select();

    if (error) {
      console.error(`Error saving data to ${tableName}:`, error);
      toast.error(`Failed to save to ${tableName}: ${error.message}`); // Show Supabase error
      return undefined;
    }
    return savedData?.[0] as T;
  } catch (error: any) { // Catch unexpected errors
    console.error(`Unexpected error saving data to ${tableName}:`, error);
    toast.error(`An unexpected error occurred while saving to ${tableName}: ${error.message}`);
    return undefined;
  }
};

// Generic function to update data in Supabase
export const updateSupabaseData = async <T>(
  tableName: string,
  id: string,
  updates: Partial<T>,
): Promise<T | undefined> => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating data in ${tableName}:`, error);
      toast.error(`Failed to update ${tableName}: ${error.message}`); // Show Supabase error
      return undefined;
    }
    return data as T;
  } catch (error: any) { // Catch unexpected errors
    console.error(`Unexpected error updating data in ${tableName}:`, error);
    toast.error(`An unexpected error occurred while updating ${tableName}: ${error.message}`);
    return undefined;
  }
};

// Generic function to delete data from Supabase
export const deleteSupabaseData = async (
  tableName: string,
  id: string,
): Promise<boolean> => {
  try {
    const { error } = await supabase.from(tableName).delete().eq("id", id);

    if (error) {
      console.error(`Error deleting data from ${tableName}:`, error);
      toast.error(`Failed to delete from ${tableName}: ${error.message}`); // Show Supabase error
      return false;
    }
    return true;
  } catch (error: any) { // Catch unexpected errors
      console.error(`Unexpected error deleting data from ${tableName}:`, error);
      toast.error(`An unexpected error occurred while deleting from ${tableName}: ${error.message}`);
    return false;
  }
};

// Specific functions for each data type
export const loadAreas = async (): Promise<Area[] | undefined> => {
  return loadSupabaseData<Area>("areas", "created_at", true);
};

export const saveArea = async (area: Omit<Area, "id" | "created_at">): Promise<Area | undefined> => {
  const newArea: Area = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    ...area,
  };
  return saveSupabaseData<Area>("areas", newArea);
};

export const updateArea = async (areaId: string, updates: Partial<Area>): Promise<Area | undefined> => {
  return updateSupabaseData<Area>("areas", areaId, updates);
};

export const deleteArea = async (areaId: string): Promise<boolean> => {
  return deleteSupabaseData("areas", areaId);
};

export const loadTasks = async (): Promise<Task[] | undefined> => {
  return loadSupabaseData<Task>("tasks", "created_at", true);
};

export const saveTask = async (task: Omit<Task, "id" | "created_at">): Promise<Task | undefined> => {
  const newTask: Task = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    completed: task.completed || false,
    ...task,
  };
  return saveSupabaseData<Task>("tasks", newTask);
};

export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<Task | undefined> => {
  return updateSupabaseData<Task>("tasks", taskId, updates);
};

export const deleteTask = async (taskId: string): Promise<boolean> => {
  return deleteSupabaseData("tasks", taskId);
};

export const loadHourlyResponses = async (): Promise<HourlyResponse[] | undefined> => {
  return loadSupabaseData<HourlyResponse>("hourly_responses", "timestamp", false); // Order by timestamp descending
};

export const saveHourlyResponse = async (response: Omit<HourlyResponse, "id" | "timestamp">): Promise<HourlyResponse | undefined> => {
  const newResponse: HourlyResponse = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...response,
  };
  return saveSupabaseData<HourlyResponse>("hourly_responses", newResponse);
};

// Keep localStorage functions for NotificationScheduler if needed, or remove if not used elsewhere
export const loadState = <T>(key: string): T | undefined => {
  try {
    const serializedState = localStorage.getItem(key);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState) as T;
  } catch (error) {
    console.error("Error loading state from localStorage:", error);
    return undefined;
  }
};

export const saveState = <T>(key: string, state: T) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(key, serializedState);
  } catch (error) {
    console.error("Error saving state to localStorage:", error);
  }
};