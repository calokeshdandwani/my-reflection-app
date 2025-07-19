-- Create the hourly_responses table
CREATE TABLE public.hourly_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT now(),
  response TEXT NOT NULL
);

-- Create the areas table
CREATE TABLE public.areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create the tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id UUID REFERENCES public.areas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 3,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  parent_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE
);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE public.hourly_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (read/write for now, you can refine this later)
CREATE POLICY "Allow all for hourly_responses" ON public.hourly_responses
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for areas" ON public.areas
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for tasks" ON public.tasks
  FOR ALL USING (true) WITH CHECK (true);