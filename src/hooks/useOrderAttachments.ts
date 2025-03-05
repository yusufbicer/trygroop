
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OrderAttachment } from '@/types/data';
import { useToast } from '@/hooks/use-toast';

export const useOrderAttachments = () => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Upload attachment
  const uploadAttachment = async (orderId: string, file: File) => {
    setLoading(true);
    try {
      // Validate file type
      const allowedTypes = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only PDF, DOC, DOCX, XLS, and XLSX files are allowed.');
      }
      
      // Upload file to storage
      const filePath = `order_attachments/${orderId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('order_attachments')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Add file record to the database
      const { error: dbError } = await supabase
        .from('order_attachments')
        .insert({
          order_id: orderId,
          file_path: filePath,
          file_name: file.name,
          file_type: file.type,
        });
        
      if (dbError) throw dbError;
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setLoading(false);
      return { success: true };
      
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  // Delete attachment
  const deleteAttachment = async (attachment: OrderAttachment) => {
    setLoading(true);
    try {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('order_attachments')
        .remove([attachment.file_path]);
        
      if (storageError) throw storageError;
      
      // Delete record from database
      const { error: dbError } = await supabase
        .from('order_attachments')
        .delete()
        .eq('id', attachment.id);
        
      if (dbError) throw dbError;
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setLoading(false);
      return { success: true };
      
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  // Download attachment
  const downloadAttachment = async (attachment: OrderAttachment) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('order_attachments')
        .download(attachment.file_path);
        
      if (error) throw error;
      
      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
      
      setLoading(false);
      return { success: true };
      
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  return {
    loading,
    uploadAttachment,
    deleteAttachment,
    downloadAttachment
  };
};
