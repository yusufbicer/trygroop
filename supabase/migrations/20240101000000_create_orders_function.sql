-- Create a function to create the orders table if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_orders_table()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the orders table already exists
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'orders'
  ) THEN
    -- Create the orders table
    CREATE TABLE public.orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id),
      product_name TEXT NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Add RLS policies
    ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

    -- Create a simple policy that allows all access
    CREATE POLICY "Allow all access" ON public.orders FOR ALL USING (true);

    -- Add a trigger to update the updated_at column
    CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON public.orders
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();

    RETURN TRUE;
  ELSE
    -- If table exists, ensure it has the right policies
    DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
    DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
    DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
    DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
    DROP POLICY IF EXISTS "Admins can insert orders for any user" ON public.orders;
    DROP POLICY IF EXISTS "Admins can update any order" ON public.orders;
    DROP POLICY IF EXISTS "Admins can delete any order" ON public.orders;
    DROP POLICY IF EXISTS "Allow all access" ON public.orders;
    
    -- Create a simple policy that allows all access
    CREATE POLICY "Allow all access" ON public.orders FOR ALL USING (true);
    
    RETURN FALSE;
  END IF;
END;
$$;

-- Create the set_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_orders_table() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_orders_table() TO anon; 