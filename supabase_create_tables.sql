-- Create 'areas' table
CREATE TABLE public.areas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create 'tasks' table
CREATE TABLE public.tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    area_id uuid NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
    name text NOT NULL,
    priority integer NOT NULL DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
    completed boolean NOT NULL DEFAULT FALSE,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    parent_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
    scheduled_for date,
    schedule_order integer
);

-- Create 'hourly_responses' table
CREATE TABLE public.hourly_responses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp timestamp with time zone DEFAULT now() NOT NULL,
    response text NOT NULL
);