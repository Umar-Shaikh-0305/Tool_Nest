-- ==============================================================================
-- ToolNest Database Schema & Row Level Security (RLS) Policies
-- Safe for multi-domain, serverless deployments (Vercel + Supabase)
-- ==============================================================================

-- 1. Create Rate Limits Table (Serverless persistent counter)
CREATE TABLE IF NOT EXISTS public.rate_limits (
    key TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 1,
    window_start TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Note: rate_limits is only read & modified by the serverless backend via SUPABASE_SERVICE_ROLE_KEY.
-- We deny all public/anon direct access from the browser.
CREATE POLICY "Deny anon access to rate_limits" 
ON public.rate_limits 
FOR ALL 
TO anon 
USING (false);

-- Atomic Postgres function to increment and enforce rate limits safely across concurrent requests
CREATE OR REPLACE FUNCTION public.increment_and_check(
    p_key TEXT,
    p_window_seconds INTEGER,
    p_max_requests INTEGER
) 
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
    v_record RECORD;
    v_now TIMESTAMPTZ := NOW();
BEGIN
    SELECT * INTO v_record FROM public.rate_limits WHERE key = p_key;

    IF NOT FOUND THEN
        INSERT INTO public.rate_limits (key, count, window_start)
        VALUES (p_key, 1, v_now);
        RETURN TRUE;
    END IF;

    -- If window has expired, reset counter and window_start
    IF v_now > v_record.window_start + (p_window_seconds || ' seconds')::INTERVAL THEN
        UPDATE public.rate_limits
        SET count = 1, window_start = v_now
        WHERE key = p_key;
        RETURN TRUE;
    END IF;

    -- If count is within limit, increment
    IF v_record.count < p_max_requests THEN
        UPDATE public.rate_limits
        SET count = count + 1
        WHERE key = p_key;
        RETURN TRUE;
    ELSE
        -- Limit exceeded
        RETURN FALSE;
    END IF;
END;
$$;

-- 2. Create User History Table
CREATE TABLE IF NOT EXISTS public.user_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tool_slug TEXT NOT NULL,
    title TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on user_history
ALTER TABLE public.user_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own history entries
CREATE POLICY "Users can select own history" 
ON public.user_history 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own history entries
CREATE POLICY "Users can insert own history" 
ON public.user_history 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own history entries
CREATE POLICY "Users can delete own history" 
ON public.user_history 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_user_history_user_id ON public.user_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_history_created_at ON public.user_history(created_at DESC);
