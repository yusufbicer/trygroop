-- Create a function to create the user_roles table
CREATE OR REPLACE FUNCTION public.create_user_roles_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create user_roles table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, role)
  );

  -- Enable RLS on user_roles table
  ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
  DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;
  DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;
  DROP POLICY IF EXISTS "Users can delete their own roles" ON public.user_roles;
  
  -- Create policies that allow users to manage their own roles
  CREATE POLICY "Users can view their own roles"
    ON public.user_roles
    FOR SELECT
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert their own roles"
    ON public.user_roles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update their own roles"
    ON public.user_roles
    FOR UPDATE
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can delete their own roles"
    ON public.user_roles
    FOR DELETE
    USING (auth.uid() = user_id);
END;
$$; 