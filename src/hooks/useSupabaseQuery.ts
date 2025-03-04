
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface UseSupabaseQueryProps {
  key: string[];
  table: string;
  column?: string;
  value?: string | number | boolean;
  select?: string;
  order?: { column: string; ascending?: boolean };
  single?: boolean;
}

export function useSupabaseQuery<T>({
  key,
  table,
  column,
  value,
  select = '*',
  order,
  single = false,
}: UseSupabaseQueryProps) {
  const { user } = useAuth();

  return useQuery({
    queryKey: key,
    queryFn: async () => {
      // Use type assertion to bypass TypeScript checks for Supabase client
      // This avoids the excessive type instantiation error
      let query = (supabase as any).from(table).select(select);

      // Add filter if specified
      if (column && value !== undefined) {
        query = query.eq(column, value);
      }

      // Add order if specified
      if (order) {
        query = query.order(order.column, {
          ascending: order.ascending ?? true,
        });
      }

      // Execute as single or multiple
      const { data, error } = single ? await query.single() : await query;

      if (error) {
        console.error(`Error fetching ${table}:`, error);
        throw error;
      }

      return data as T;
    },
    enabled: !!user, // Only run the query if the user is authenticated
  });
}
