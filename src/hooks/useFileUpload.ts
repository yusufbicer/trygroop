
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (file: File, userId: string) => {
    if (!file) return null;
    
    try {
      setIsUploading(true);
      
      // Create a unique file path including the user ID for RLS policies
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('order_attachments')
        .upload(fileName, file);
      
      if (error) {
        throw error;
      }
      
      return {
        path: data?.path,
        name: file.name,
        type: file.type
      };
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('order_attachments')
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  };

  return {
    uploadFile,
    getFileUrl,
    isUploading
  };
};
