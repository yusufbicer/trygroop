
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface UseSupabaseMutationProps {
  table: string;
  queryKey: string[];
  operation: 'insert' | 'update' | 'delete' | 'upsert';
  successMessage?: string;
  errorMessage?: string;
}

export function useSupabaseMutation<T>({
  table,
  queryKey,
  operation,
  successMessage = 'Operation successful',
  errorMessage = 'Operation failed',
}: UseSupabaseMutationProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: any) => {
      let query;

      switch (operation) {
        case 'insert':
          // @ts-ignore - Ignoring type check for now until the database types are generated
          query = supabase.from(table).insert(data);
          break;
        case 'update':
          if (!data.id) throw new Error('ID is required for update operations');
          // @ts-ignore - Ignoring type check for now until the database types are generated
          query = supabase.from(table).update(data).eq('id', data.id);
          break;
        case 'delete':
          if (!data.id) throw new Error('ID is required for delete operations');
          // @ts-ignore - Ignoring type check for now until the database types are generated
          query = supabase.from(table).delete().eq('id', data.id);
          break;
        case 'upsert':
          // @ts-ignore - Ignoring type check for now until the database types are generated
          query = supabase.from(table).upsert(data);
          break;
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }

      const { data: responseData, error } = await query;
      
      if (error) {
        console.error(`Error in ${operation} operation on ${table}:`, error);
        throw error;
      }

      return responseData as T;
    },
    onSuccess: () => {
      // Invalidate the query to refetch data
      queryClient.invalidateQueries({ queryKey });
      
      // Show success toast
      toast({
        title: 'Success',
        description: successMessage,
      });
    },
    onError: (error: any) => {
      // Show error toast
      toast({
        title: 'Error',
        description: errorMessage || error.message,
        variant: 'destructive',
      });
    },
  });
}
