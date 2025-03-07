import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Copy, Edit, Trash2, File, AlertCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface OrderData {
  id: string;
  title: string;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  details: string | null;
  total_volume: number | null;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<OrderData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { toast } = useToast();
  const { isAdmin, user } = useAuth();

  useEffect(() => {
    if (isAdmin && user) {
      fetchOrders();
    } else {
      setIsLoading(false);
      setError("You don't have admin permissions to view orders.");
    }
  }, [isAdmin, user]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    
    try {
      // First, check if the orders table exists and is accessible
      const { data: tableInfo, error: tableError } = await supabase
        .from('orders')
        .select('count(*)', { count: 'exact', head: true });
      
      if (tableError) {
        console.error('Error checking orders table:', tableError);
        setDebugInfo({ tableCheck: tableError });
        throw new Error(`Table access error: ${tableError.message}`);
      }
      
      // Now fetch the actual orders
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        setDebugInfo({ fetchError: error });
        throw error;
      }

      if (!data || data.length === 0) {
        // No error but no data either - this is not an error state
        console.log('No orders found in the database');
        setOrders([]);
      } else {
        console.log(`Successfully fetched ${data.length} orders`);
        setOrders(data);
      }
    } catch (error: any) {
      console.error('Error in orders fetch operation:', error);
      setError(error.message || 'Failed to fetch orders');
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch orders',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fix the filter function inside the component
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    return orders.filter(order => {
      // Filter by search term (title, id, etc.)
      const matchesSearch = !searchTerm || 
        order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by status
      const matchesStatus = !statusFilter || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Copied to clipboard',
    });
  };

  if (!isAdmin) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You don't have permission to view this page. Please contact an administrator if you believe this is an error.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Manage Orders</h1>
          <p className="text-white/70">View and manage all orders</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchOrders} 
          disabled={isLoading}
          className="mt-4 sm:mt-0"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
          <Input
            type="text"
            placeholder="Search orders..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-groop-blue"></div>
        </div>
      ) : !orders || orders.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-10 text-center">
            <h3 className="text-lg font-medium text-white mb-1">No orders found</h3>
            <p className="text-white/70 mb-4">
              {searchTerm || statusFilter 
                ? "No orders match your search criteria" 
                : "There are no orders in the system yet"}
            </p>
            {debugInfo && (
              <div className="mt-4 p-4 bg-black/20 rounded text-left text-xs overflow-auto max-h-40">
                <p className="font-semibold mb-2">Debug Information:</p>
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">All Orders</CardTitle>
            <CardDescription>Total: {filteredOrders.length} orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.title}</TableCell>
                    <TableCell>
                      <Badge variant={
                        order.status === 'delivered' ? 'success' :
                        order.status === 'shipped' ? 'info' :
                        order.status === 'processing' ? 'warning' :
                        order.status === 'cancelled' ? 'destructive' :
                        'default'
                      }>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => copyToClipboard(order.id)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Order ID
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.location.href = `/admin/orders/${order.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Order
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500 focus:text-red-500">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminOrders;
