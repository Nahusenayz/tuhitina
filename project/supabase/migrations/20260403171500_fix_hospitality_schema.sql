-- SQL Migration to fix missing amenities column and complete hospitality schema

-- 1. Create or Update 'hotels' table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'hotels') THEN
        CREATE TABLE public.hotels (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            name text NOT NULL,
            location text NOT NULL,
            price_per_night numeric NOT NULL,
            rating numeric DEFAULT 5,
            image_url text,
            description text,
            amenities text[] DEFAULT '{}',
            created_at timestamptz DEFAULT now()
        );
    ELSE
        -- Ensure 'amenities' column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotels' AND column_name = 'amenities') THEN
            ALTER TABLE public.hotels ADD COLUMN amenities text[] DEFAULT '{}';
        END IF;

        -- Ensure 'description' column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotels' AND column_name = 'description') THEN
            ALTER TABLE public.hotels ADD COLUMN description text;
        END IF;
    END IF;
END $$;

-- 2. Create 'experiences' table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.experiences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    location text NOT NULL,
    price numeric NOT NULL,
    rating numeric DEFAULT 5,
    image_url text,
    description text,
    category text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- 3. Create 'services' table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text NOT NULL,
    price numeric NOT NULL,
    category text NOT NULL,
    image_url text,
    is_available boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- 4. Enable RLS and add basic policies
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Add policies for authenticated access (adjust as needed for your project)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'hotels' AND policyname = 'Allow all operations for authenticated users') THEN
        CREATE POLICY "Allow all operations for authenticated users" ON public.hotels FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'experiences' AND policyname = 'Allow all operations for authenticated users') THEN
        CREATE POLICY "Allow all operations for authenticated users" ON public.experiences FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'services' AND policyname = 'Allow all operations for authenticated users') THEN
        CREATE POLICY "Allow all operations for authenticated users" ON public.services FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;
