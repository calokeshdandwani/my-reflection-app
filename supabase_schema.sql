-- Add parent_id column to tasks table if it doesn't exist
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='parent_id') THEN
            ALTER TABLE public.tasks ADD COLUMN parent_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE;
        END IF;
    END
    $$;