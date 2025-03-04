
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSupabaseStorage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = async (bucket: string, path: string, file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const { data, error } = await (supabase.storage as any)
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress: { loaded: number; total: number }) => {
            const percent = (progress.loaded / progress.total) * 100;
            setUploadProgress(percent);
          },
        });
      
      return { data, error };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { data: null, error };
    } finally {
      setIsUploading(false);
    }
  };

  const getPublicUrl = (bucket: string, path: string) => {
    const { data } = (supabase.storage as any)
      .from(bucket)
      .getPublicUrl(path);
    
    return data?.publicUrl || null;
  };

  const deleteFile = async (bucket: string, path: string) => {
    try {
      const { data, error } = await (supabase.storage as any)
        .from(bucket)
        .remove([path]);
      
      return { data, error };
    } catch (error) {
      console.error('Error deleting file:', error);
      return { data: null, error };
    }
  };

  return {
    uploadFile,
    getPublicUrl,
    deleteFile,
    isUploading,
    uploadProgress,
  };
};
