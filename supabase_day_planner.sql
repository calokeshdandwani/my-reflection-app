CREATE TABLE day_planner_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (task_id, date),
  CONSTRAINT fk_task
    FOREIGN KEY(task_id)
    REFERENCES tasks(id)
    ON DELETE CASCADE
);
