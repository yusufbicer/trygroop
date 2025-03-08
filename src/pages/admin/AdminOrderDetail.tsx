
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrders } from '@/hooks/useOrders';
import { useSuppliers } from '@/hooks/useSuppliers';
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Truck, 
  CreditCard, 
  CheckCircle2, 
  Paperclip, 
  ArrowLeft,
  Plus,
  Save,
  RefreshCcw
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Order, Tracking, Payment, Suborder } from '@/types/data';

const AdminOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { fetchOrderWithDetails, updateOrder, createSuborder, createTracking, createPayment } = useOrders();
  const { suppliers } = useSuppliers();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Modals state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isSuborderModalOpen, setIsSuborderModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  // Form states
  const [newStatus, setNewStatus] = useState('');
  
  const [newSuborder, setNewSuborder] = useState({
    supplier_id: '',
    status: 'pending',
    volume_m3: '',
    details: ''
  });
  
  const [newTracking, setNewTracking] = useState({
    status: 'pending',
    location: '',
    notes: ''
  });
  
  const [newPayment, setNewPayment] = useState({
    amount: '',
    currency: 'USD',
    status: 'pending',
    payment_method: '',
    payment_date: '',
    notes: ''
  });

  useEffect(() => {
    loadOrderDetails();
  }, [id]);

  const loadOrderDetails = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const orderData = await fetchOrderWithDetails(id);
      if (orderData) {
        setOrder(orderData);
        setOrderDetails(orderData);
        setNewStatus(orderData.status);
      } else {
        toast({
          title: 'Error',
          description: 'Order not found',
          variant: 'destructive',
        });
        navigate('/admin/orders');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load order details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!id || !order) return;
    
    setIsSaving(true);
    try {
      await updateOrder.mutateAsync({
        id,
        status: newStatus
      });
      
      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });
      
      setIsStatusModalOpen(false);
      loadOrderDetails();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update order status',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSuborder = async () => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      const volume = newSuborder.volume_m3 ? parseFloat(newSuborder.volume_m3) : null;
      
      await createSuborder.mutateAsync({
        order_id: id,
        supplier_id: newSuborder.supplier_id || null,
        status: newSuborder.status,
        volume_m3: volume,
        details: newSuborder.details || ''
      });
      
      toast({
        title: 'Success',
        description: 'Suborder added successfully',
      });
      
      setIsSuborderModalOpen(false);
      setNewSuborder({
        supplier_id: '',
        status: 'pending',
        volume_m3: '',
        details: ''
      });
      loadOrderDetails();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add suborder',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTracking = async () => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      await createTracking.mutateAsync({
        order_id: id,
        status: newTracking.status,
        location: newTracking.location || '',
        notes: newTracking.notes || ''
      });
      
      toast({
        title: 'Success',
        description: 'Tracking information added successfully',
      });
      
      setIsTrackingModalOpen(false);
      setNewTracking({
        status: 'pending',
        location: '',
        notes: ''
      });
      loadOrderDetails();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add tracking information',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPayment = async () => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      const amount = parseFloat(newPayment.amount);
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid payment amount');
      }
      
      await createPayment.mutateAsync({
        order_id: id,
        amount,
        currency: newPayment.currency,
        status: newPayment.status,
        payment_method: newPayment.payment_method || '',
        payment_date: newPayment.payment_date ? new Date(newPayment.payment_date).toISOString() : null,
        notes: newPayment.notes || ''
      });
      
      toast({
        title: 'Success',
        description: 'Payment information added successfully',
      });
      
      setIsPaymentModalOpen(false);
      setNewPayment({
        amount: '',
        currency: 'USD',
        status: 'pending',
        payment_method: '',
        payment_date: '',
        notes: ''
      });
      loadOrderDetails();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add payment information',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getStatusColorClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500/20 text-green-500';
      case 'processing':
        return 'bg-blue-500/20 text-blue-500';
      case 'shipping':
        return 'bg-purple-500/20 text-purple-500';
      case 'pending':
      default:
        return 'bg-yellow-500/20 text-yellow-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-groop-blue"></div>
      </div>
    );
  }

  if (!order || !orderDetails) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-gray-500 mb-6">The order you are looking for does not exist or you do not have permission to view it.</p>
          <Button onClick={() => navigate('/admin/orders')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate('/admin/orders')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => loadOrderDetails()}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Update Status
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Order Status</DialogTitle>
                <DialogDescription>
                  Update the status of this order to reflect its current state.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipping">Shipping</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsStatusModalOpen(false)}>Cancel</Button>
                <Button onClick={handleStatusUpdate} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{order.title}</CardTitle>
                <CardDescription>
                  Created on {formatDate(order.created_at)}
                </CardDescription>
              </div>
              <Badge className={getStatusColorClass(order.status)}>
                {order.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details">
                <TabsList className="mb-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="suborders">Suborders</TabsTrigger>
                  <TabsTrigger value="tracking">Tracking</TabsTrigger>
                  <TabsTrigger value="payments">Payments</TabsTrigger>
                </TabsList>

                <TabsContent value="details">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Order Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Status</p>
                          <p className="font-medium">{order.status}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Order Date</p>
                          <p className="font-medium">{formatDate(order.created_at)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Customer</p>
                          <p className="font-medium">
                            {orderDetails.profile?.first_name || orderDetails.profile?.last_name ? 
                              `${orderDetails.profile?.first_name || ''} ${orderDetails.profile?.last_name || ''}` : 
                              'No name'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Customer ID</p>
                          <p className="font-medium">{order.user_id}</p>
                        </div>
                        {order.total_volume && (
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">Total Volume</p>
                            <p className="font-medium">{order.total_volume} m³</p>
                          </div>
                        )}
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Last Updated</p>
                          <p className="font-medium">{formatDate(order.updated_at)}</p>
                        </div>
                      </div>
                    </div>

                    {order.details && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">Details</h3>
                        <p className="text-gray-700">{order.details}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="suborders">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Suborders</h3>
                    <Dialog open={isSuborderModalOpen} onOpenChange={setIsSuborderModalOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Suborder
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Suborder</DialogTitle>
                          <DialogDescription>
                            Create a new suborder for this order.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                          <div className="space-y-2">
                            <label htmlFor="supplier" className="text-sm font-medium">Supplier</label>
                            <Select value={newSuborder.supplier_id} onValueChange={(value) => setNewSuborder({...newSuborder, supplier_id: value})}>
                              <SelectTrigger id="supplier">
                                <SelectValue placeholder="Select supplier" />
                              </SelectTrigger>
                              <SelectContent>
                                {suppliers.map((supplier) => (
                                  <SelectItem key={supplier.id} value={supplier.id}>
                                    {supplier.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="suborder-status" className="text-sm font-medium">Status</label>
                            <Select value={newSuborder.status} onValueChange={(value) => setNewSuborder({...newSuborder, status: value})}>
                              <SelectTrigger id="suborder-status">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipping">Shipping</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="volume" className="text-sm font-medium">Volume (m³)</label>
                            <Input
                              id="volume"
                              type="number"
                              placeholder="Enter volume"
                              value={newSuborder.volume_m3}
                              onChange={(e) => setNewSuborder({...newSuborder, volume_m3: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="suborder-details" className="text-sm font-medium">Details</label>
                            <Textarea
                              id="suborder-details"
                              placeholder="Enter details about this suborder"
                              value={newSuborder.details}
                              onChange={(e) => setNewSuborder({...newSuborder, details: e.target.value})}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsSuborderModalOpen(false)}>Cancel</Button>
                          <Button onClick={handleAddSuborder} disabled={isSaving}>
                            {isSaving ? 'Adding...' : 'Add Suborder'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {orderDetails.suborders?.length === 0 ? (
                    <div className="py-6 text-center">
                      <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-1">No Suborders</h3>
                      <p className="text-gray-500">This order doesn't have any suborders yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orderDetails.suborders?.map((suborder: any) => (
                        <Card key={suborder.id}>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-medium">
                                  {suborder.suppliers ? suborder.suppliers.name : 'No Supplier'}
                                </h3>
                                <Badge className={`mt-1 ${getStatusColorClass(suborder.status)}`}>
                                  {suborder.status}
                                </Badge>
                              </div>
                              {suborder.volume_m3 && (
                                <div className="text-right">
                                  <span className="text-sm text-gray-500">Volume</span>
                                  <p className="font-medium">{suborder.volume_m3} m³</p>
                                </div>
                              )}
                            </div>
                            {suborder.details && (
                              <div className="mt-4">
                                <p className="text-sm text-gray-500 mb-1">Details</p>
                                <p className="text-gray-700">{suborder.details}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="tracking">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Tracking Information</h3>
                    <Dialog open={isTrackingModalOpen} onOpenChange={setIsTrackingModalOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Tracking
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Tracking Information</DialogTitle>
                          <DialogDescription>
                            Add tracking details for this order.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                          <div className="space-y-2">
                            <label htmlFor="tracking-status" className="text-sm font-medium">Status</label>
                            <Select value={newTracking.status} onValueChange={(value) => setNewTracking({...newTracking, status: value})}>
                              <SelectTrigger id="tracking-status">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="in transit">In Transit</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="location" className="text-sm font-medium">Location</label>
                            <Input
                              id="location"
                              placeholder="Enter location"
                              value={newTracking.location}
                              onChange={(e) => setNewTracking({...newTracking, location: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="tracking-notes" className="text-sm font-medium">Notes</label>
                            <Textarea
                              id="tracking-notes"
                              placeholder="Enter tracking notes"
                              value={newTracking.notes}
                              onChange={(e) => setNewTracking({...newTracking, notes: e.target.value})}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsTrackingModalOpen(false)}>Cancel</Button>
                          <Button onClick={handleAddTracking} disabled={isSaving}>
                            {isSaving ? 'Adding...' : 'Add Tracking'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {orderDetails.tracking?.length === 0 ? (
                    <div className="py-6 text-center">
                      <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-1">No Tracking Information</h3>
                      <p className="text-gray-500">This order doesn't have any tracking updates yet.</p>
                    </div>
                  ) : (
                    <div className="relative space-y-0">
                      <div className="absolute left-5 top-6 bottom-6 w-[2px] bg-gray-200"></div>
                      
                      {orderDetails.tracking?.map((tracking: any, index: number) => (
                        <div key={tracking.id} className="relative pl-14 py-4">
                          <div className={`absolute left-4 top-5 h-4 w-4 rounded-full border-2 
                            ${index === 0 ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`}
                          ></div>
                          
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-medium text-lg">{tracking.status}</h3>
                              {tracking.location && (
                                <span className="text-gray-500 ml-2">at {tracking.location}</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{formatDate(tracking.created_at)}</p>
                            {tracking.notes && (
                              <p className="mt-2 text-gray-700">{tracking.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="payments">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Payment Information</h3>
                    <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Payment
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Payment Information</DialogTitle>
                          <DialogDescription>
                            Record a payment for this order.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                          <div className="space-y-2">
                            <label htmlFor="amount" className="text-sm font-medium">Amount</label>
                            <Input
                              id="amount"
                              type="number"
                              placeholder="Enter amount"
                              value={newPayment.amount}
                              onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="currency" className="text-sm font-medium">Currency</label>
                            <Select value={newPayment.currency} onValueChange={(value) => setNewPayment({...newPayment, currency: value})}>
                              <SelectTrigger id="currency">
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="EUR">EUR</SelectItem>
                                <SelectItem value="GBP">GBP</SelectItem>
                                <SelectItem value="CAD">CAD</SelectItem>
                                <SelectItem value="AUD">AUD</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="payment-status" className="text-sm font-medium">Status</label>
                            <Select value={newPayment.status} onValueChange={(value) => setNewPayment({...newPayment, status: value})}>
                              <SelectTrigger id="payment-status">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="refunded">Refunded</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="payment-method" className="text-sm font-medium">Payment Method</label>
                            <Input
                              id="payment-method"
                              placeholder="Enter payment method"
                              value={newPayment.payment_method}
                              onChange={(e) => setNewPayment({...newPayment, payment_method: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="payment-date" className="text-sm font-medium">Payment Date</label>
                            <Input
                              id="payment-date"
                              type="date"
                              value={newPayment.payment_date}
                              onChange={(e) => setNewPayment({...newPayment, payment_date: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="payment-notes" className="text-sm font-medium">Notes</label>
                            <Textarea
                              id="payment-notes"
                              placeholder="Enter payment notes"
                              value={newPayment.notes}
                              onChange={(e) => setNewPayment({...newPayment, notes: e.target.value})}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>Cancel</Button>
                          <Button onClick={handleAddPayment} disabled={isSaving}>
                            {isSaving ? 'Adding...' : 'Add Payment'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {orderDetails.payments?.length === 0 ? (
                    <div className="py-6 text-center">
                      <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-1">No Payment Information</h3>
                      <p className="text-gray-500">This order doesn't have any payment information yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orderDetails.payments?.map((payment: any) => (
                        <Card key={payment.id}>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-medium text-lg">
                                  {payment.amount} {payment.currency}
                                </h3>
                                <Badge className={getStatusColorClass(payment.status)}>
                                  {payment.status}
                                </Badge>
                              </div>
                              
                              {payment.payment_date && (
                                <div className="text-right">
                                  <span className="text-sm text-gray-500">Payment Date</span>
                                  <p className="font-medium">{formatDate(payment.payment_date)}</p>
                                </div>
                              )}
                            </div>
                            
                            {payment.payment_method && (
                              <div className="mb-2">
                                <p className="text-sm text-gray-500">Method</p>
                                <p className="font-medium">{payment.payment_method}</p>
                              </div>
                            )}
                            
                            {payment.notes && (
                              <div className="mt-4">
                                <p className="text-sm text-gray-500 mb-1">Notes</p>
                                <p className="text-gray-700">{payment.notes}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="flex items-center mt-1">
                    <Badge className={getStatusColorClass(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm text-gray-500">Customer</div>
                  <div className="font-medium mt-1">
                    {orderDetails.profile?.first_name || orderDetails.profile?.last_name ? 
                      `${orderDetails.profile?.first_name || ''} ${orderDetails.profile?.last_name || ''}` : 
                      'No name'}
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm text-gray-500">Order Date</div>
                  <div className="font-medium mt-1">
                    {formatDate(order.created_at)}
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm text-gray-500">Suborders</div>
                  <div className="font-medium mt-1">
                    {orderDetails.suborders?.length || 0}
                  </div>
                </div>
                {order.total_volume && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-sm text-gray-500">Total Volume</div>
                      <div className="font-medium mt-1">
                        {order.total_volume} m³
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" onClick={() => setIsStatusModalOpen(true)}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Update Status
              </Button>
              <Button className="w-full" onClick={() => setIsSuborderModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Suborder
              </Button>
              <Button className="w-full" onClick={() => setIsTrackingModalOpen(true)}>
                <Truck className="mr-2 h-4 w-4" />
                Add Tracking
              </Button>
              <Button className="w-full" onClick={() => setIsPaymentModalOpen(true)}>
                <CreditCard className="mr-2 h-4 w-4" />
                Add Payment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
