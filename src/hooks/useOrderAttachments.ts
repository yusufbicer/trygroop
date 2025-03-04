
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OrderAttachment } from '@/types/data';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseStorage } from './useSupabaseStorage';

export const useOrderAttachments = (orderId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const { deleteFile } = useSupabaseStorage();

  // Fetch attachments for a specific order
  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ['order-attachments', orderId],
    queryFn: async () => {
      if (!orderId) return [];
      
      const { data, error } = await (supabase.from('order_attachments') as any)
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });
      
      if (error) {
        toast({
          title: 'Error fetching attachments',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      return data || [];
    },
    enabled: !!orderId,
  });

  // Add attachment
  const addAttachment = useMutation({
    mutationFn: async (newAttachment: Omit<OrderAttachment, 'id' | 'created_at'>) => {
      setLoading(true);
      const { data, error } = await (supabase.from('order_attachments') as any)
        .insert(newAttachment)
        .select()
        .single();
        
      if (error) throw error;
      setLoading(false);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-attachments', orderId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error adding attachment',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    },
  });

  // Delete attachment
  const removeAttachment = useMutation({
    mutationFn: async (attachment: OrderAttachment) => {
      setLoading(true);
      
      // First delete the file from storage
      await deleteFile('order_attachments', attachment.file_path);
      
      // Then delete the record from database
      const { error } = await (supabase.from('order_attachments') as any)
        .delete()
        .eq('id', attachment.id);
        
      if (error) throw error;
      setLoading(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-attachments', orderId] });
      toast({
        title: 'Attachment removed',
        description: 'Attachment has been removed successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error removing attachment',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    },
  });

  return {
    attachments,
    isLoading: isLoading || loading,
    addAttachment,
    removeAttachment,
  };
};
