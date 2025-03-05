
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, Suborder, Tracking, Payment } from '@/types/data';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export const useOrders = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const { isAdmin } = useAuth();

  // Fetch orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', userId, isAdmin],
    queryFn: async () => {
      let query = supabase.from('orders').select('*');
      
      // If not admin or userId is specified, filter by user_id
      if (!isAdmin || userId) {
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
    enabled: isAdmin || !!userId,
  });

  // Fetch a single order with all related data
  const fetchOrderWithDetails = async (orderId: string) => {
    try {
      // Get order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
        
      if (orderError) throw orderError;
      
      // Get user profile for the order
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', order.user_id)
        .single();
      
      // Get suborders
      const { data: suborders, error: subordersError } = await supabase
        .from('suborders')
        .select(`
          *,
          suppliers:supplier_id (
            name
          )
        `)
        .eq('order_id', orderId);
        
      // Get tracking information
      const { data: tracking, error: trackingError } = await supabase
        .from('tracking')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });
        
      // Get payment information
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });
        
      // Get order attachments
      const { data: attachments, error: attachmentsError } = await supabase
        .from('order_attachments')
        .select('*')
        .eq('order_id', orderId);
      
      if (subordersError || trackingError || paymentsError || attachmentsError) {
        console.error("Errors fetching related data:", {
          subordersError, trackingError, paymentsError, attachmentsError
        });
      }
      
      return {
        ...order,
        profile: userProfile || { first_name: null, last_name: null },
        suborders: suborders || [],
        tracking: tracking || [],
        payments: payments || [],
        attachments: attachments || []
      };
    } catch (error: any) {
      toast({
        title: 'Error fetching order details',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
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

  // Create suborder
  const createSuborder = useMutation({
    mutationFn: async (newSuborder: Omit<Suborder, 'id' | 'created_at' | 'updated_at'>) => {
      setLoading(true);
      const { data, error } = await supabase
        .from('suborders')
        .insert(newSuborder)
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
        title: 'Error creating suborder',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    },
  });

  // Update suborder
  const updateSuborder = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Suborder> & { id: string }) => {
      setLoading(true);
      const { data, error } = await supabase
        .from('suborders')
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
        title: 'Error updating suborder',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    },
  });

  // Delete suborder
  const deleteSuborder = useMutation({
    mutationFn: async (id: string) => {
      setLoading(true);
      const { error } = await supabase
        .from('suborders')
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
        title: 'Error deleting suborder',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    },
  });

  // Create tracking
  const createTracking = useMutation({
    mutationFn: async (newTracking: Omit<Tracking, 'id' | 'created_at' | 'updated_at'>) => {
      setLoading(true);
      const { data, error } = await supabase
        .from('tracking')
        .insert(newTracking)
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
        title: 'Error creating tracking',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    },
  });

  // Update tracking
  const updateTracking = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Tracking> & { id: string }) => {
      setLoading(true);
      const { data, error } = await supabase
        .from('tracking')
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
        title: 'Error updating tracking',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    },
  });

  // Delete tracking
  const deleteTracking = useMutation({
    mutationFn: async (id: string) => {
      setLoading(true);
      const { error } = await supabase
        .from('tracking')
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
        title: 'Error deleting tracking',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    },
  });

  // Create payment
  const createPayment = useMutation({
    mutationFn: async (newPayment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) => {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .insert(newPayment)
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
        title: 'Error creating payment',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    },
  });

  // Update payment
  const updatePayment = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Payment> & { id: string }) => {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
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
        title: 'Error updating payment',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    },
  });

  // Delete payment
  const deletePayment = useMutation({
    mutationFn: async (id: string) => {
      setLoading(true);
      const { error } = await supabase
        .from('payments')
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
        title: 'Error deleting payment',
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
    fetchOrderWithDetails,
    createOrder,
    updateOrder,
    deleteOrder,
    createSuborder,
    updateSuborder,
    deleteSuborder,
    createTracking,
    updateTracking,
    deleteTracking,
    createPayment,
    updatePayment,
    deletePayment
  };
};
