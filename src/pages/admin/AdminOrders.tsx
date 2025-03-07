import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Define the order data structure
interface OrderData {
  id: string;
  user_id: string;
  product_name: string;
  amount: number;
  status: string;
  created_at: string;
}

// Sample orders data for when the database is not accessible
const sampleOrders: OrderData[] = [
  {
    id: '1',
    user_id: 'sample-user-1',
    product_name: 'Premium Subscription',
    amount: 29.99,
    status: 'completed',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
  },
  {
    id: '2',
    user_id: 'sample-user-2',
    product_name: 'Basic Subscription',
    amount: 9.99,
    status: 'pending',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: '3',
    user_id: 'sample-user-3',
    product_name: 'Enterprise Plan',
    amount: 99.99,
    status: 'completed',
    created_at: new Date().toISOString(), // today
  },
];

const AdminOrders = () => {
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useSampleData, setUseSampleData] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, useSampleData]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    if (useSampleData) {
      // Use sample data
      setOrders(sampleOrders);
      setLoading(false);
      return;
    }

    try {
      // First, try to fetch orders from the database
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') { // Table doesn't exist error
          // Try to create the orders table
          await createOrdersTable();
          
          // Try fetching again
          const { data: retryData, error: retryError } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (retryError) {
            console.error('Error fetching orders after table creation:', retryError);
            throw new Error(`Could not fetch orders: ${retryError.message}`);
          }
          
          setOrders(retryData || []);
        } else {
          console.error('Error fetching orders:', error);
          throw new Error(`Could not fetch orders: ${error.message}`);
        }
      } else {
        setOrders(data || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      setError(err.message || 'Failed to fetch orders');
      
      // Fall back to sample data
      setOrders(sampleOrders);
    } finally {
      setLoading(false);
    }
  };

  const createOrdersTable = async () => {
    try {
      // Create the orders table using standard Supabase client
      const { error } = await supabase.rpc('create_orders_table');
      
      if (error) {
        // If the RPC function doesn't exist, try direct SQL
        console.error('Error creating orders table via RPC:', error);
        console.log('Falling back to sample data');
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error creating orders table:', err);
      return false;
    }
  };

  if (!isAdmin) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You do not have permission to view this page. Please contact an administrator.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Order Management</h1>
          <p className="text-white/70">View and manage customer orders</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setUseSampleData(!useSampleData)}
          >
            {useSampleData ? 'Try Real Data' : 'Use Sample Data'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchOrders} 
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Orders
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="glass">
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            {useSampleData ? 'Showing sample data' : 'Showing all customer orders'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="h-8 w-8 rounded-full border-2 border-t-transparent border-blue-500 animate-spin"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-white/70">
              <p>No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.user_id}</TableCell>
                      <TableCell>{order.product_name}</TableCell>
                      <TableCell>${order.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.status === 'completed' 
                            ? 'bg-green-500/20 text-green-500' 
                            : order.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : 'bg-red-500/20 text-red-500'
                        }`}>
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrders;
