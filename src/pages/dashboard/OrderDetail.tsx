import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { CustomButton } from '@/components/ui/CustomButton';
import { Package, Truck, CreditCard, CheckCircle2, Paperclip, ArrowLeft } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Order, Tracking, Payment, Suborder } from '@/types/data';

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [trackings, setTrackings] = useState<Tracking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [suborders, setSuborders] = useState<Suborder[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!id || !user) return;
      
      setLoading(true);
      try {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (orderError) throw orderError;
        if (!orderData) {
          toast({
            title: 'Order not found',
            description: 'The order you are looking for does not exist or you do not have permission to view it.',
            variant: 'destructive',
          });
          navigate('/dashboard/orders');
          return;
        }
        
        setOrder(orderData);
        
        const { data: trackingData, error: trackingError } = await supabase
          .from('tracking')
          .select('*')
          .eq('order_id', id)
          .order('created_at', { ascending: false });
        
        if (trackingError) throw trackingError;
        setTrackings(trackingData || []);
        
        const { data: paymentData, error: paymentError } = await supabase
          .from('payments')
          .select('*')
          .eq('order_id', id)
          .order('created_at', { ascending: false });
        
        if (paymentError) throw paymentError;
        setPayments(paymentData || []);
        
        const { data: suborderData, error: suborderError } = await supabase
          .from('suborders')
          .select(`
            *,
            suppliers:supplier_id (
              name
            )
          `)
          .eq('order_id', id)
          .order('created_at', { ascending: false });
        
        if (suborderError) throw suborderError;
        setSuborders(suborderData || []);
        
        const { data: attachmentData, error: attachmentError } = await supabase
          .from('order_attachments')
          .select('*')
          .eq('order_id', id)
          .order('created_at', { ascending: false });
        
        if (attachmentError) throw attachmentError;
        setAttachments(attachmentData || []);
        
      } catch (error: any) {
        toast({
          title: 'Error loading order',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderData();
  }, [id, user, navigate, toast]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-groop-blue"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-gray-500 mb-6">The order you are looking for does not exist or you do not have permission to view it.</p>
          <Button onClick={() => navigate('/dashboard/orders')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate('/dashboard/orders')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
        </div>
        <Badge className={getStatusColorClass(order.status)}>
          {order.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{order.title}</CardTitle>
          <CardDescription>
            Created on {formatDate(order.created_at)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="suborders">Suborders</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
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
              {suborders.length === 0 ? (
                <div className="py-6 text-center">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-1">No Suborders</h3>
                  <p className="text-gray-500">This order doesn't have any suborders yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {suborders.map((suborder) => (
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

            <TabsContent value="attachments">
              {attachments.length === 0 ? (
                <div className="py-6 text-center">
                  <Paperclip className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-1">No Attachments</h3>
                  <p className="text-gray-500">There are no attachments for this order yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {attachments.map((attachment) => (
                    <div 
                      key={attachment.id}
                      className="flex items-center p-4 border rounded-md"
                    >
                      <Paperclip className="h-5 w-5 mr-3 text-gray-400" />
                      <div>
                        <p className="font-medium">{attachment.file_name}</p>
                        <p className="text-xs text-gray-500">{formatDate(attachment.created_at)}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="ml-auto">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="tracking">
              {trackings.length === 0 ? (
                <div className="py-6 text-center">
                  <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-1">No Tracking Information</h3>
                  <p className="text-gray-500">This order doesn't have any tracking updates yet.</p>
                </div>
              ) : (
                <div className="relative space-y-0">
                  <div className="absolute left-5 top-6 bottom-6 w-[2px] bg-gray-200"></div>
                  
                  {trackings.map((tracking, index) => (
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
              {payments.length === 0 ? (
                <div className="py-6 text-center">
                  <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-1">No Payment Information</h3>
                  <p className="text-gray-500">This order doesn't have any payment information yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
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
  );
};

export default OrderDetail;
