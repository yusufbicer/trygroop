-- Function to fix RLS policies on user_roles table
CREATE OR REPLACE FUNCTION fix_user_roles_rls()
RETURNS void AS $$
BEGIN
    -- Check if user_roles table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
        -- Drop existing RLS policies on user_roles table
        DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
        DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
        DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
        DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
        DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
        
        -- Create new RLS policies that allow users to assign admin roles to themselves
        
        -- Everyone can view their own roles
        CREATE POLICY "Users can view their own roles"
            ON public.user_roles
            FOR SELECT
            USING (auth.uid() = user_id);
        
        -- Everyone can insert their own roles (this allows self-assignment of admin)
        CREATE POLICY "Users can insert their own roles"
            ON public.user_roles
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);
        
        -- Only the user can update their own roles
        CREATE POLICY "Users can update their own roles"
            ON public.user_roles
            FOR UPDATE
            USING (auth.uid() = user_id);
        
        -- Only the user can delete their own roles
        CREATE POLICY "Users can delete their own roles"
            ON public.user_roles
            FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to fix RLS policies
SELECT fix_user_roles_rls(); 