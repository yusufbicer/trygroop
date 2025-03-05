
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSupabaseStorage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const validateFileType = (file: File, allowedTypes: string[] = []) => {
    if (allowedTypes.length === 0) return true;
    
    return allowedTypes.some(type => {
      // Check if type contains a wildcard (e.g., 'image/*')
      if (type.endsWith('/*')) {
        const category = type.split('/')[0];
        return file.type.startsWith(`${category}/`);
      }
      return file.type === type;
    });
  };

  const uploadFile = async (
    bucket: string, 
    path: string, 
    file: File, 
    allowedTypes: string[] = []
  ) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    // Validate file type if allowedTypes are provided
    if (allowedTypes.length > 0 && !validateFileType(file, allowedTypes)) {
      setIsUploading(false);
      toast({
        title: "Invalid file type",
        description: `File type ${file.type} is not allowed`,
        variant: "destructive"
      });
      return { data: null, error: new Error("Invalid file type") };
    }
    
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

  const downloadFile = async (bucket: string, path: string, fileName: string) => {
    try {
      const { data, error } = await (supabase.storage as any)
        .from(bucket)
        .download(path);
        
      if (error) {
        throw error;
      }
      
      // Create download link and trigger download
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || path.split('/').pop() || 'download';
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download failed",
        description: "Could not download the file",
        variant: "destructive"
      });
      return { success: false, error };
    }
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
    downloadFile,
    deleteFile,
    isUploading,
    uploadProgress,
  };
};
