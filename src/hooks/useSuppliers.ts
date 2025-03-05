import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Supplier } from '@/types/data';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export const useSuppliers = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const { isAdmin } = useAuth();

  // Fetch suppliers
  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers', userId, isAdmin],
    queryFn: async () => {
      let query = supabase.from('suppliers').select('*');
      
      // If admin and no specific userId is provided, fetch all suppliers
      // Otherwise, if not admin or a specific userId is provided, filter by user_id
      if (!isAdmin && userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) {
        toast({
          title: 'Error fetching suppliers',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      return data || [];
    },
  });

  // Create supplier
  const createSupplier = useMutation({
    mutationFn: async (newSupplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
      setLoading(true);
      const { data, error } = await supabase
        .from('suppliers')
        .insert(newSupplier)
        .select()
        .single();
        
      if (error) throw error;
      setLoading(false);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Supplier created',
        description: 'Supplier has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating supplier',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    },
  });

  // Update supplier
  const updateSupplier = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Supplier> & { id: string }) => {
      setLoading(true);
      const { data, error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      setLoading(false);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Supplier updated',
        description: 'Supplier has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating supplier',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    },
  });

  // Delete supplier
  const deleteSupplier = useMutation({
    mutationFn: async (id: string) => {
      setLoading(true);
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      setLoading(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Supplier deleted',
        description: 'Supplier has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting supplier',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    },
  });

  return {
    suppliers,
    isLoading: isLoading || loading,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  };
};
