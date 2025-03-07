import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        if (!orderId) throw new Error("Order ID is required");

        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (error) throw error;

        setOrder(data as Order);
      } catch (error: any) {
        console.error("Error fetching order:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-groop-darker">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-groop-blue"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto py-12">
        <Card className="glass">
          <CardContent className="py-10 text-center">
            <h3 className="text-lg font-medium text-white mb-1">Order not found</h3>
            <p className="text-white/70 mb-4">
              The requested order could not be found.
            </p>
            <Link to="/dashboard" className="text-groop-blue hover:underline">
              Back to Dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center mb-4">
            <Link to="/dashboard" className="flex items-center text-groop-blue hover:underline mr-4">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div>
                <span className="text-white/70">Order ID:</span>
                <p className="text-white font-bold">{order.id}</p>
              </div>
              <div>
                <span className="text-white/70">Created on:</span>
                <p className="text-white font-bold">{formatDate(order.created_at)}</p>
              </div>
              <div>
                <span className="text-white/70">Last updated:</span>
                <p className="text-white font-bold">{formatDate(order.updated_at)}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-white/70">Status:</span>
                <p className="text-white font-bold">
                  <Badge>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</Badge>
                </p>
              </div>
              <div>
                <span className="text-white/70">Total volume:</span>
                <p className="text-white font-bold">{order.total_volume} m³</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-white/70">Title:</span>
            <p className="text-white font-bold">{order.title}</p>
          </div>
          <div className="space-y-2">
            <span className="text-white/70">Details:</span>
            <p className="text-white font-bold">{order.details || 'No details provided'}</p>
          </div>
          <Link to="/dashboard" className="text-groop-blue hover:underline block mt-8">
            Back to Dashboard
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetail;
