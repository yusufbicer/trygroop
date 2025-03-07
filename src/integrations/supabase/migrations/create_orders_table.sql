-- Create a function to create the orders table if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_orders_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the orders table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'orders'
  ) THEN
    -- Create the orders table
    CREATE TABLE public.orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      details TEXT,
      total_volume NUMERIC,
      user_id UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Add comment to the table
    COMMENT ON TABLE public.orders IS 'Stores order information';

    -- Create RLS policies
    ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

    -- Policy for users to view their own orders
    CREATE POLICY "Users can view their own orders"
      ON public.orders
      FOR SELECT
      USING (auth.uid() = user_id);

    -- Policy for users to insert their own orders
    CREATE POLICY "Users can insert their own orders"
      ON public.orders
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    -- Policy for users to update their own orders
    CREATE POLICY "Users can update their own orders"
      ON public.orders
      FOR UPDATE
      USING (auth.uid() = user_id);

    -- Policy for admins to view all orders
    CREATE POLICY "Admins can view all orders"
      ON public.orders
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid()
          AND role = 'admin'
        )
      );

    -- Policy for admins to insert orders
    CREATE POLICY "Admins can insert orders"
      ON public.orders
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid()
          AND role = 'admin'
        )
      );

    -- Policy for admins to update orders
    CREATE POLICY "Admins can update orders"
      ON public.orders
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid()
          AND role = 'admin'
        )
      );

    -- Policy for admins to delete orders
    CREATE POLICY "Admins can delete orders"
      ON public.orders
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid()
          AND role = 'admin'
        )
      );

    -- Create user_roles table if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = 'user_roles'
    ) THEN
      CREATE TABLE public.user_roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        role TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        UNIQUE(user_id, role)
      );

      -- Add comment to the table
      COMMENT ON TABLE public.user_roles IS 'Stores user roles for authorization';

      -- Create RLS policies for user_roles
      ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

      -- Policy for users to view their own roles
      CREATE POLICY "Users can view their own roles"
        ON public.user_roles
        FOR SELECT
        USING (auth.uid() = user_id);

      -- Policy for admins to view all roles
      CREATE POLICY "Admins can view all roles"
        ON public.user_roles
        FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
          )
        );

      -- Policy for admins to insert roles
      CREATE POLICY "Admins can insert roles"
        ON public.user_roles
        FOR INSERT
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
          )
        );

      -- Policy for admins to update roles
      CREATE POLICY "Admins can update roles"
        ON public.user_roles
        FOR UPDATE
        USING (
          EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
          )
        );

      -- Policy for admins to delete roles
      CREATE POLICY "Admins can delete roles"
        ON public.user_roles
        FOR DELETE
        USING (
          EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
          )
        );
    END IF;
  END IF;
END;
$$; 