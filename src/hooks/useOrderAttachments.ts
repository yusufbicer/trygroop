
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OrderAttachment } from '@/types/data';
import { useToast } from '@/hooks/use-toast';
import { useFileUpload } from './useFileUpload';

export const useOrderAttachments = (orderId?: string) => {
  const { toast } = useToast();
  const { uploadFile, getFileUrl } = useFileUpload();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Fetch attachments for an order
  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ['orderAttachments', orderId],
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
      
      return data.map((attachment: OrderAttachment) => ({
        ...attachment,
        url: getFileUrl(attachment.file_path)
      })) || [];
    },
    enabled: !!orderId
  });

  // Add an attachment to an order
  const addAttachment = useMutation({
    mutationFn: async ({ file, orderId, userId }: { file: File; orderId: string; userId: string }) => {
      setLoading(true);
      
      // 1. Upload the file to storage
      const uploadResult = await uploadFile(file, userId);
      
      if (!uploadResult) {
        throw new Error('File upload failed');
      }
      
      // 2. Create the attachment record
      const newAttachment = {
        order_id: orderId,
        file_path: uploadResult.path,
        file_name: uploadResult.name,
        file_type: uploadResult.type
      };
      
      const { data, error } = await (supabase.from('order_attachments') as any)
        .insert(newAttachment)
        .select()
        .single();
      
      if (error) throw error;
      
      setLoading(false);
      return {
        ...data,
        url: getFileUrl(data.file_path)
      };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orderAttachments', variables.orderId] });
      toast({
        title: 'Attachment added',
        description: 'File has been attached to the order successfully.',
      });
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

  // Delete an attachment
  const deleteAttachment = useMutation({
    mutationFn: async ({ id, filePath, orderId }: { id: string; filePath: string; orderId: string }) => {
      setLoading(true);
      
      // 1. Delete the file from storage
      const { error: storageError } = await supabase.storage
        .from('order_attachments')
        .remove([filePath]);
      
      if (storageError) {
        console.error('Error deleting file:', storageError);
        // Continue with deletion of the record even if file deletion fails
      }
      
      // 2. Delete the attachment record
      const { error } = await (supabase.from('order_attachments') as any)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setLoading(false);
      return { id, orderId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orderAttachments', data.orderId] });
      toast({
        title: 'Attachment deleted',
        description: 'File has been removed from the order successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting attachment',
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
    deleteAttachment,
    getFileUrl
  };
};
