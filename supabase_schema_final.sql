-- Create the 'hourly_responses' table
CREATE TABLE public.hourly_responses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp timestamp with time zone DEFAULT now() NOT NULL,
    response text NOT NULL
);

-- Set up Row Level Security (RLS) policies for basic access
-- For 'areas' table
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for areas" ON public.areas FOR ALL USING (true) WITH CHECK (true);

-- For 'tasks' table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);

-- For 'hourly_responses' table
ALTER TABLE public.hourly_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for hourly_responses" ON public.hourly_responses FOR ALL USING (true) WITH CHECK (true);