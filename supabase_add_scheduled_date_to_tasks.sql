-- Add the scheduled_date column to the tasks table
-- This migration adds a new column to the tasks table to store the scheduled date of a task.
-- The column is of type TIMESTAMPTZ, which stores a timestamp with a time zone.
-- The column is allowed to be NULL, as not all tasks will be scheduled.
ALTER TABLE tasks
ADD COLUMN scheduled_date TIMESTAMPTZ;
