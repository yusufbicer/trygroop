import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '@/hooks/useOrders';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useToast } from '@/hooks/use-toast';
import { useOrderAttachments } from '@/hooks/useOrderAttachments';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Suborder, Tracking, Payment, OrderAttachment } from '@/types/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Package,
  Truck,
  CreditCard,
  FileText,
  ArrowLeft,
  Plus,
  FilePlus,
  Trash,
  Edit,
  Calendar,
  MapPin,
  DollarSign,
} from 'lucide-react';

const AdminOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { fetchOrderWithDetails, createSuborder, updateSuborder, deleteSuborder, 
         createTracking, updateTracking, deleteTracking, 
         createPayment, updatePayment, deletePayment } = useOrders();
  const { suppliers } = useSuppliers();
  const { uploadAttachment, deleteAttachment, downloadAttachment } = useOrderAttachments();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSuborderDialog, setActiveSuborderDialog] = useState(false);
  const [activeTrackingDialog, setActiveTrackingDialog] = useState(false);
  const [activePaymentDialog, setActivePaymentDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [fileUploading, setFileUploading] = useState(false);

  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (id) {
      loadOrderDetails();
    }
  }, [id]);

  const loadOrderDetails = async () => {
    setIsLoading(true);
    try {
      const orderData = await fetchOrderWithDetails(id!);
      setOrder(orderData);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load order details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const suborderSchema = z.object({
    supplier_id: z.string().optional().nullable(),
    volume_m3: z.number().min(0).optional().nullable(),
    status: z.string(),
    details: z.string().optional().nullable(),
  });

  const trackingSchema = z.object({
    status: z.string(),
    location: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  });

  const paymentSchema = z.object({
    amount: z.number().min(0),
    currency: z.string(),
    status: z.string(),
    payment_method: z.string().optional().nullable(),
    payment_date: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  });

  const suborderForm = useForm<z.infer<typeof suborderSchema>>({
    resolver: zodResolver(suborderSchema),
    defaultValues: {
      supplier_id: null,
      volume_m3: null,
      status: 'pending',
      details: null,
    },
  });

  const trackingForm = useForm<z.infer<typeof trackingSchema>>({
    resolver: zodResolver(trackingSchema),
    defaultValues: {
      status: 'pending',
      location: null,
      notes: null,
    },
  });

  const paymentForm = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      currency: 'USD',
      status: 'pending',
      payment_method: null,
      payment_date: null,
      notes: null,
    },
  });

  const onSubmitSuborder = async (values: z.infer<typeof suborderSchema>) => {
    try {
      if (editingItem) {
        await updateSuborder.mutateAsync({
          id: editingItem.id,
          ...values,
          volume_m3: values.volume_m3 || null,
        });
        toast({
          title: 'Success',
          description: 'Suborder updated successfully',
        });
      } else {
        await createSuborder.mutateAsync({
          order_id: id!,
          status: values.status,
          details: values.details || '',
          supplier_id: values.supplier_id || null,
          volume_m3: values.volume_m3 || null,
        });
        toast({
          title: 'Success',
          description: 'Suborder created successfully',
        });
      }
      setActiveSuborderDialog(false);
      setEditingItem(null);
      suborderForm.reset();
      loadOrderDetails();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save suborder',
        variant: 'destructive',
      });
    }
  };

  const onSubmitTracking = async (values: z.infer<typeof trackingSchema>) => {
    try {
      if (editingItem) {
        await updateTracking.mutateAsync({
          id: editingItem.id,
          ...values,
        });
        toast({
          title: 'Success',
          description: 'Tracking updated successfully',
        });
      } else {
        await createTracking.mutateAsync({
          order_id: id!,
          status: values.status,
          location: values.location || '',
          notes: values.notes || '',
        });
        toast({
          title: 'Success',
          description: 'Tracking created successfully',
        });
      }
      setActiveTrackingDialog(false);
      setEditingItem(null);
      trackingForm.reset();
      loadOrderDetails();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save tracking',
        variant: 'destructive',
      });
    }
  };

  const onSubmitPayment = async (values: z.infer<typeof paymentSchema>) => {
    try {
      if (editingItem) {
        await updatePayment.mutateAsync({
          id: editingItem.id,
          ...values,
        });
        toast({
          title: 'Success',
          description: 'Payment updated successfully',
        });
      } else {
        await createPayment.mutateAsync({
          order_id: id!,
          amount: values.amount,
          currency: values.currency,
          status: values.status,
          payment_method: values.payment_method || '',
          payment_date: values.payment_date || null,
          notes: values.notes || '',
        });
        toast({
          title: 'Success',
          description: 'Payment created successfully',
        });
      }
      setActivePaymentDialog(false);
      setEditingItem(null);
      paymentForm.reset();
      loadOrderDetails();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save payment',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSuborder = async (id: string) => {
    try {
      await deleteSuborder.mutateAsync(id);
      toast({
        title: 'Success',
        description: 'Suborder deleted successfully',
      });
      loadOrderDetails();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete suborder',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTracking = async (id: string) => {
    try {
      await deleteTracking.mutateAsync(id);
      toast({
        title: 'Success',
        description: 'Tracking deleted successfully',
      });
      loadOrderDetails();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete tracking',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePayment = async (id: string) => {
    try {
      await deletePayment.mutateAsync(id);
      toast({
        title: 'Success',
        description: 'Payment deleted successfully',
      });
      loadOrderDetails();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete payment',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                          'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Only PDF, DOC, DOCX, XLS, and XLSX files are allowed',
        variant: 'destructive',
      });
      return;
    }
    
    setFileUploading(true);
    try {
      await uploadAttachment(id!, file);
      toast({
        title: 'Success',
        description: 'File uploaded successfully',
      });
      loadOrderDetails();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setFileUploading(false);
    }
  };

  const handleDownloadFile = async (attachment: OrderAttachment) => {
    try {
      await downloadAttachment(attachment);
      toast({
        title: 'Success',
        description: 'File download started',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to download file',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteFile = async (attachment: OrderAttachment) => {
    try {
      await deleteAttachment(attachment);
      toast({
        title: 'Success',
        description: 'File deleted successfully',
      });
      loadOrderDetails();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete file',
        variant: 'destructive',
      });
    }
  };

  const handleEditSuborder = (suborder: Suborder) => {
    setEditingItem(suborder);
    suborderForm.reset({
      supplier_id: suborder.supplier_id,
      volume_m3: suborder.volume_m3 || null,
      status: suborder.status,
      details: suborder.details,
    });
    setActiveSuborderDialog(true);
  };

  const handleEditTracking = (tracking: Tracking) => {
    setEditingItem(tracking);
    trackingForm.reset({
      status: tracking.status,
      location: tracking.location,
      notes: tracking.notes,
    });
    setActiveTrackingDialog(true);
  };

  const handleEditPayment = (payment: Payment) => {
    setEditingItem(payment);
    paymentForm.reset({
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      payment_method: payment.payment_method,
      payment_date: payment.payment_date ? new Date(payment.payment_date).toISOString().split('T')[0] : null,
      notes: payment.notes,
    });
    setActivePaymentDialog(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'processing':
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      case 'shipping':
        return 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20';
      case 'pending':
      default:
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-groop-blue"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-white mb-2">Order not found</h2>
        <p className="text-white/70 mb-4">The order you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button variant="outline" onClick={() => navigate('/admin/orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/orders')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-white">{order.title}</h1>
          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="details" className="flex items-center">
            <Package className="mr-2 h-4 w-4" /> Details
          </TabsTrigger>
          <TabsTrigger value="suborders" className="flex items-center">
            <Truck className="mr-2 h-4 w-4" /> Suborders
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center">
            <MapPin className="mr-2 h-4 w-4" /> Tracking
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center">
            <CreditCard className="mr-2 h-4 w-4" /> Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
              <CardDescription>Basic details about this order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-white/70">Order ID</h3>
                  <p className="text-white">{order.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/70">Created</h3>
                  <p className="text-white">{formatDate(order.created_at)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/70">User</h3>
                  <p className="text-white">
                    {order.profile?.first_name || ''} {order.profile?.last_name || ''}
                    <span className="ml-2 text-white/50">({order.user_id})</span>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/70">Total Volume</h3>
                  <p className="text-white">{order.total_volume ? `${order.total_volume} m³` : 'Not specified'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white/70">Details</h3>
                <p className="text-white">{order.details || 'No details provided'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Attachments</CardTitle>
                  <CardDescription>Documents related to this order</CardDescription>
                </div>
                <div>
                  <Button size="sm" className="relative">
                    <FilePlus className="mr-2 h-4 w-4" /> Upload Document
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      disabled={fileUploading}
                    />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {order.attachments && order.attachments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>File Type</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.attachments.map((attachment: OrderAttachment) => (
                      <TableRow key={attachment.id}>
                        <TableCell className="font-medium">{attachment.file_name}</TableCell>
                        <TableCell>{attachment.file_type}</TableCell>
                        <TableCell>{formatDate(attachment.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadFile(attachment)}
                            className="mr-2"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFile(attachment)}
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-white/50">
                  <FileText className="mx-auto h-8 w-8 mb-2" />
                  <p>No attachments yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suborders" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Suborders</CardTitle>
                  <CardDescription>Manage shipments from suppliers</CardDescription>
                </div>
                <Button onClick={() => {
                  setEditingItem(null);
                  suborderForm.reset({
                    supplier_id: null,
                    volume_m3: null,
                    status: 'pending',
                    details: null,
                  });
                  setActiveSuborderDialog(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" /> Add Suborder
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {order.suborders && order.suborders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.suborders.map((suborder: Suborder) => (
                      <TableRow key={suborder.id}>
                        <TableCell>{suborder.suppliers?.name || 'No supplier'}</TableCell>
                        <TableCell>{suborder.volume_m3 ? `${suborder.volume_m3} m³` : '-'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(suborder.status)}>{suborder.status}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(suborder.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSuborder(suborder)}
                            className="mr-2"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSuborder(suborder.id)}
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-white/50">
                  <Truck className="mx-auto h-8 w-8 mb-2" />
                  <p>No suborders yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={activeSuborderDialog} onOpenChange={setActiveSuborderDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Suborder' : 'Add Suborder'}</DialogTitle>
                <DialogDescription>
                  {editingItem ? 'Update the suborder details' : 'Create a new shipment from a supplier'}
                </DialogDescription>
              </DialogHeader>
              <Form {...suborderForm}>
                <form onSubmit={suborderForm.handleSubmit(onSubmitSuborder)} className="space-y-4">
                  <FormField
                    control={suborderForm.control}
                    name="supplier_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a supplier" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">No supplier</SelectItem>
                            {suppliers?.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={suborderForm.control}
                    name="volume_m3"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Volume (m³)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Enter volume"
                            value={field.value === null ? '' : field.value}
                            onChange={(e) => {
                              const value = e.target.value === '' ? null : parseFloat(e.target.value);
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={suborderForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipping">Shipping</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={suborderForm.control}
                    name="details"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Details</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter any additional details"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">{editingItem ? 'Update' : 'Create'}</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Tracking History</CardTitle>
                  <CardDescription>Shipment tracking updates</CardDescription>
                </div>
                <Button onClick={() => {
                  setEditingItem(null);
                  trackingForm.reset({
                    status: 'pending',
                    location: null,
                    notes: null,
                  });
                  setActiveTrackingDialog(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" /> Add Tracking
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {order.tracking && order.tracking.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.tracking.map((item: Tracking) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                        </TableCell>
                        <TableCell>{item.location || '-'}</TableCell>
                        <TableCell>{formatDate(item.created_at)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{item.notes || '-'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTracking(item)}
                            className="mr-2"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTracking(item.id)}
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-white/50">
                  <MapPin className="mx-auto h-8 w-8 mb-2" />
                  <p>No tracking information yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={activeTrackingDialog} onOpenChange={setActiveTrackingDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Tracking' : 'Add Tracking'}</DialogTitle>
                <DialogDescription>
                  {editingItem ? 'Update the tracking information' : 'Add a new tracking update'}
                </DialogDescription>
              </DialogHeader>
              <Form {...trackingForm}>
                <form onSubmit={trackingForm.handleSubmit(onSubmitTracking)} className="space-y-4">
                  <FormField
                    control={trackingForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="in_transit">In Transit</SelectItem>
                            <SelectItem value="customs">Customs</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={trackingForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter location"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={trackingForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter any additional notes"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">{editingItem ? 'Update' : 'Create'}</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>Payment records for this order</CardDescription>
                </div>
                <Button onClick={() => {
                  setEditingItem(null);
                  paymentForm.reset({
                    amount: 0,
                    currency: 'USD',
                    status: 'pending',
                    payment_method: null,
                    payment_date: null,
                    notes: null,
                  });
                  setActivePaymentDialog(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" /> Add Payment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {order.payments && order.payments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.payments.map((payment: Payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {payment.amount} {payment.currency}
                        </TableCell>
                        <TableCell>{payment.payment_method || '-'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                        </TableCell>
                        <TableCell>{payment.payment_date ? formatDate(payment.payment_date) : formatDate(payment.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPayment(payment)}
                            className="mr-2"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePayment(payment.id)}
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-white/50">
                  <DollarSign className="mx-auto h-8 w-8 mb-2" />
                  <p>No payment records yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={activePaymentDialog} onOpenChange={setActivePaymentDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Payment' : 'Add Payment'}</DialogTitle>
                <DialogDescription>
                  {editingItem ? 'Update the payment details' : 'Record a new payment for this order'}
                </DialogDescription>
              </DialogHeader>
              <Form {...paymentForm}>
                <form onSubmit={paymentForm.handleSubmit(onSubmitPayment)} className="space-y-4">
                  <FormField
                    control={paymentForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Enter amount"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={paymentForm.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                            <SelectItem value="CAD">CAD</SelectItem>
                            <SelectItem value="AUD">AUD</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={paymentForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={paymentForm.control}
                    name="payment_method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Credit Card, Bank Transfer"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={paymentForm.control}
                    name="payment_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={paymentForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter any additional notes"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">{editingItem ? 'Update' : 'Create'}</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminOrderDetail;
