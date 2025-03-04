
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/data';
import { useToast } from '@/hooks/use-toast';

export const useOrders = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Fetch orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', userId],
    queryFn: async () => {
      let query = supabase.from('orders').select('*');
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        toast({
          title: 'Error fetching orders',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      return data || [];
    },
    enabled: !!userId,
  });

  // Fetch a single order
  const fetchOrder = async (orderId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
      
    if (error) {
      toast({
        title: 'Error fetching order',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
    
    return data;
  };

  // Create order
  const createOrder = useMutation({
    mutationFn: async (newOrder: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .insert(newOrder)
        .select()
        .single();
        
      if (error) throw error;
      setLoading(false);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating order',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    },
  });

  // Update order
  const updateOrder = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Order> & { id: string }) => {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      setLoading(false);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating order',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    },
  });

  // Delete order
  const deleteOrder = useMutation({
    mutationFn: async (id: string) => {
      setLoading(true);
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      setLoading(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting order',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    },
  });

  return {
    orders,
    isLoading: isLoading || loading,
    fetchOrder,
    createOrder,
    updateOrder,
    deleteOrder,
  };
};
