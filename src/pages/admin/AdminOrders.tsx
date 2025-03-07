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
  const [useSampleData, setUseSampleData] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
  }, [useSampleData]);

  const createOrdersTable = async () => {
    try {
      console.log("Attempting to create orders table...");
      
      // First try using the RPC function
      const { error: rpcError } = await supabase.rpc('create_orders_table');
      
      if (rpcError) {
        console.error("RPC error creating orders table:", rpcError);
        
        // If RPC fails, try creating the table directly
        const { error: createError } = await supabase.from('orders').insert([]).select();
        
        if (createError && createError.code === '42P01') {
          // Table doesn't exist, create it manually
          const createTableQuery = `
            CREATE TABLE IF NOT EXISTS public.orders (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID NOT NULL,
              product_name TEXT NOT NULL,
              amount DECIMAL(10, 2) NOT NULL,
              status TEXT NOT NULL DEFAULT 'pending',
              created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
              updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );
            
            ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY "Allow all access" ON public.orders FOR ALL USING (true);
          `;
          
          // Execute the query using Supabase's REST API
          try {
            const response = await fetch(`${supabase.supabaseUrl}/rest/v1/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabase.supabaseKey,
                'Authorization': `Bearer ${supabase.supabaseKey}`,
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({ query: createTableQuery })
            });
            
            if (!response.ok) {
              const errorData = await response.text();
              console.error("Error creating table via REST API:", errorData);
              return false;
            }
            
            console.log("Successfully created orders table via REST API");
            return true;
          } catch (restError) {
            console.error("Exception creating table via REST API:", restError);
            return false;
          }
        }
        
        return false;
      }
      
      console.log("Successfully created orders table via RPC");
      return true;
    } catch (err) {
      console.error("Exception in createOrdersTable:", err);
      return false;
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo(null);

    if (useSampleData) {
      // Use sample data
      setOrders(sampleOrders);
      setLoading(false);
      return;
    }

    try {
      console.log("Fetching real orders data...");
      
      // First check if the orders table exists
      const { count, error: checkError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      
      if (checkError) {
        console.error("Error checking orders table:", checkError);
        
        if (checkError.code === '42P01') {
          console.log("Orders table doesn't exist, attempting to create it...");
          const created = await createOrdersTable();
          
          if (!created) {
            throw new Error("Failed to create orders table");
          }
          
          // Try fetching again after creating the table
          console.log("Table created, fetching orders...");
        } else {
          throw new Error(`Error checking orders table: ${checkError.message}`);
        }
      }
      
      // Try to fetch orders from the database
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        setDebugInfo({ fetchError: error });
        throw new Error(`Could not fetch orders: ${error.message}`);
      }
      
      console.log(`Successfully fetched ${data?.length || 0} orders`);
      
      // If no orders exist, create some sample ones
      if (!data || data.length === 0) {
        console.log("No orders found, creating sample orders...");
        
        try {
          const sampleOrdersForDB = sampleOrders.map(order => ({
            user_id: user?.id || order.user_id,
            product_name: order.product_name,
            amount: order.amount,
            status: order.status
          }));
          
          const { error: insertError } = await supabase
            .from('orders')
            .insert(sampleOrdersForDB);
          
          if (insertError) {
            console.error("Error inserting sample orders:", insertError);
            setDebugInfo({ insertError });
          } else {
            console.log("Successfully inserted sample orders");
            
            // Fetch the newly inserted orders
            const { data: newData, error: refetchError } = await supabase
              .from('orders')
              .select('*')
              .order('created_at', { ascending: false });
            
            if (refetchError) {
              console.error("Error fetching after insert:", refetchError);
              setDebugInfo({ refetchError });
            } else {
              console.log(`Fetched ${newData?.length || 0} orders after insert`);
              setOrders(newData || []);
              setLoading(false);
              return;
            }
          }
        } catch (insertErr) {
          console.error("Exception inserting sample orders:", insertErr);
          setDebugInfo({ insertException: insertErr });
        }
      }
      
      setOrders(data || []);
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      setError(err.message || 'Failed to fetch orders');
      setDebugInfo({ mainError: err });
      
      // Fall back to sample data
      setOrders(sampleOrders);
    } finally {
      setLoading(false);
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
          
          {debugInfo && (
            <div className="mt-4 p-4 bg-black/20 rounded text-left text-xs overflow-auto max-h-60">
              <p className="font-semibold mb-2">Debug Information:</p>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrders;
