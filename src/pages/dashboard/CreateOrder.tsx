
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import { Plus, Upload, X, FileText, Image } from 'lucide-react';
import { useSupabaseStorage } from '@/hooks/useSupabaseStorage';
import { supabase } from '@/integrations/supabase/client';

const CreateOrder = () => {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<{[key: string]: string}>({});
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { createOrder } = useOrders(user?.id);
  const { uploadFile } = useSupabaseStorage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Create preview URLs for the files
    selectedFiles.forEach(file => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrls(prev => ({
          ...prev,
          [file.name]: fileReader.result as string
        }));
      };
      fileReader.readAsDataURL(file);
    });
    
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(file => file.name !== fileName));
    setPreviewUrls(prev => {
      const updated = { ...prev };
      delete updated[fileName];
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create an order.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Order title is required.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // First create the order - now with total_volume included
      const newOrder = {
        user_id: user.id,
        title,
        details,
        status: 'pending',
        total_volume: null // Adding the missing total_volume field
      };
      
      const order = await createOrder.mutateAsync(newOrder);
      
      // Then upload the files if any
      if (files.length > 0) {
        for (const file of files) {
          const filePath = `${user.id}/${order.id}/${file.name}`;
          const { data, error } = await uploadFile('order_attachments', filePath, file);
          
          if (error) {
            console.error("Error uploading file:", error);
            toast({
              title: "Warning",
              description: `Error uploading ${file.name}, but order was created.`,
              variant: "destructive",
            });
          } else {
            // Create order attachment record in the database - using imported supabase client
            const { error: attachmentError } = await supabase
              .from('order_attachments')
              .insert({
                order_id: order.id,
                file_path: filePath,
                file_name: file.name,
                file_type: file.type
              });
              
            if (attachmentError) {
              console.error("Error saving attachment metadata:", attachmentError);
            }
          }
        }
      }
      
      toast({
        title: "Order Created",
        description: "Your order has been created successfully.",
      });
      navigate('/dashboard/orders');
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "There was an error creating your order.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Create New Order</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
            <CardDescription>Fill in the details to create a new order</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Order Title</Label>
              <Input
                id="title"
                placeholder="Enter order title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="details">Order Details</Label>
              <Textarea
                id="details"
                placeholder="Enter order details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={5}
              />
            </div>
            
            {/* File Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="files">Attachments (Optional)</Label>
              <div className="border border-dashed border-gray-300 rounded-md p-6 text-center">
                <input
                  type="file"
                  id="files"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Label htmlFor="files" className="cursor-pointer flex flex-col items-center space-y-2">
                  <Upload className="h-10 w-10 text-gray-400" />
                  <span className="text-sm font-medium">Click to upload proformas or photos</span>
                  <span className="text-xs text-gray-500">PDF, JPG, PNG (max 10MB)</span>
                </Label>
              </div>
            </div>
            
            {/* Preview of uploaded files */}
            {files.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Files</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {files.map((file, index) => (
                    <div key={index} className="relative bg-gray-100 p-3 rounded-md flex items-center space-x-2">
                      {file.type.includes('image') ? (
                        <div className="h-14 w-14 relative bg-gray-200 rounded overflow-hidden">
                          {previewUrls[file.name] && (
                            <img 
                              src={previewUrls[file.name]} 
                              alt={file.name}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                      ) : (
                        <FileText className="h-14 w-14 text-blue-500" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeFile(file.name)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => navigate('/dashboard/orders')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Order"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreateOrder;
