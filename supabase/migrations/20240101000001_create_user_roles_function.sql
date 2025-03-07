-- Create a function to create the user_roles table if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_user_roles_table()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the user_roles table already exists
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'user_roles'
  ) THEN
    -- Create user_roles table
    CREATE TABLE public.user_roles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id),
      role TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(user_id, role)
    );

    -- Enable RLS on user_roles table
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

    -- Create policies that allow users to view their own roles
    CREATE POLICY "Users can view their own roles"
      ON public.user_roles
      FOR SELECT
      USING (auth.uid() = user_id);

    -- Create policy that allows users to insert their own roles
    CREATE POLICY "Users can insert their own roles"
      ON public.user_roles
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    -- Create policy that allows users to update their own roles
    CREATE POLICY "Users can update their own roles"
      ON public.user_roles
      FOR UPDATE
      USING (auth.uid() = user_id);

    -- Create policy that allows users to delete their own roles
    CREATE POLICY "Users can delete their own roles"
      ON public.user_roles
      FOR DELETE
      USING (auth.uid() = user_id);

    -- Create policy that allows admins to view all roles
    CREATE POLICY "Admins can view all roles"
      ON public.user_roles
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );

    -- Create policy that allows admins to insert roles for any user
    CREATE POLICY "Admins can insert roles for any user"
      ON public.user_roles
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );

    -- Create policy that allows admins to update any role
    CREATE POLICY "Admins can update any role"
      ON public.user_roles
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );

    -- Create policy that allows admins to delete any role
    CREATE POLICY "Admins can delete any role"
      ON public.user_roles
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );

    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_user_roles_table() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_roles_table() TO anon; 