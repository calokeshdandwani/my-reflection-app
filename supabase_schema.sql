-- Create the hourly_responses table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'hourly_responses') THEN
        CREATE TABLE public.hourly_responses (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            timestamp TIMESTAMPTZ DEFAULT now(),
            response TEXT NOT NULL
        );
        ALTER TABLE public.hourly_responses ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow all for hourly_responses" ON public.hourly_responses
            FOR ALL USING (true) WITH CHECK (true);
    END IF;
END
$$;

-- Create the areas table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'areas') THEN
        CREATE TABLE public.areas (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT now()
        );
        ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow all for areas" ON public.areas
            FOR ALL USING (true) WITH CHECK (true);
    END IF;
END
$$;

-- Create the tasks table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tasks') THEN
        CREATE TABLE public.tasks (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            area_id UUID REFERENCES public.areas(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            priority INTEGER NOT NULL DEFAULT 3,
            completed BOOLEAN DEFAULT FALSE,
            completed_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT now()
        );
        ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow all for tasks" ON public.tasks
            FOR ALL USING (true) WITH CHECK (true);
    END IF;
END
$$;

-- Add parent_id column to tasks table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='parent_id') THEN
        ALTER TABLE public.tasks ADD COLUMN parent_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE;
    END IF;
END
$$;