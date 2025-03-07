-- Create a function to execute arbitrary SQL
-- This function should be created with appropriate permissions
-- SECURITY DEFINER means it runs with the privileges of the creator
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$; 