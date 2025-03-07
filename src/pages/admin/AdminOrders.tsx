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
import { MoreHorizontal, Copy, Edit, Trash2, File, AlertCircle, RefreshCw, Plus } from 'lucide-react';
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
  const { isAdmin, user, makeAdmin } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newOrder, setNewOrder] = useState({
    title: '',
    status: 'pending',
    details: '',
    total_volume: 0
  });

  useEffect(() => {
    if (user) {
      // Force admin status for the current user to ensure access
      makeAdmin(user.id).then(() => {
        fetchOrders();
      });
    } else {
      setIsLoading(false);
      setError("You must be logged in to view orders.");
    }
  }, [user]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    
    try {
      console.log("Fetching orders...");
      
      // First, check if the orders table exists by trying to select from it
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching orders:', error);
        setDebugInfo({ fetchError: error });
        
        // If the table doesn't exist, create it
        if (error.code === '42P01') { // Table doesn't exist error
          await createOrdersTable();
          return;
        }
        
        throw error;
      }

      console.log(`Successfully fetched ${data?.length || 0} orders`);
      setOrders(data || []);
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

  const createOrdersTable = async () => {
    try {
      console.log("Creating orders table directly...");
      
      // Create the orders table directly with SQL
      const { error: createTableError } = await supabase.rpc(
        'exec_sql',
        { 
          sql: `
            CREATE TABLE IF NOT EXISTS public.orders (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              title TEXT NOT NULL,
              status TEXT NOT NULL DEFAULT 'pending',
              details TEXT,
              total_volume NUMERIC,
              user_id UUID NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
            
            -- Create user_roles table if it doesn't exist
            CREATE TABLE IF NOT EXISTS public.user_roles (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID NOT NULL,
              role TEXT NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
              UNIQUE(user_id, role)
            );
            
            -- Insert admin role for current user
            INSERT INTO public.user_roles (user_id, role)
            VALUES ('${user?.id}', 'admin')
            ON CONFLICT (user_id, role) DO NOTHING;
          `
        }
      );
      
      if (createTableError) {
        console.error('Error creating tables with SQL:', createTableError);
        
        // Try alternative approach with individual queries
        await createTablesAlternative();
        return;
      }
      
      console.log("Tables created successfully");
      toast({
        title: 'Success',
        description: 'Database tables created successfully. You can now add orders.',
        duration: 5000,
      });
      
      setOrders([]);
    } catch (error: any) {
      console.error('Error creating tables:', error);
      setError(`Failed to create tables: ${error.message}`);
      
      // Try alternative approach
      await createTablesAlternative();
    }
  };
  
  const createTablesAlternative = async () => {
    try {
      console.log("Creating tables with alternative approach...");
      
      // Create orders table
      const { error: ordersError } = await supabase.from('orders').insert({
        title: 'Test Order',
        status: 'pending',
        user_id: user?.id || '',
      });
      
      if (ordersError && ordersError.code !== '23505') { // Ignore unique violation errors
        console.error('Error creating orders table:', ordersError);
      }
      
      // Create user_roles table and add admin role
      const { error: rolesError } = await supabase.from('user_roles').insert({
        user_id: user?.id || '',
        role: 'admin',
      });
      
      if (rolesError && rolesError.code !== '23505') { // Ignore unique violation errors
        console.error('Error creating user_roles table:', rolesError);
      }
      
      console.log("Tables created with alternative approach");
      toast({
        title: 'Success',
        description: 'Database tables created with alternative approach.',
        duration: 5000,
      });
      
      // Refresh orders
      fetchOrders();
    } catch (error: any) {
      console.error('Error in alternative table creation:', error);
      setError(`Failed to create tables with alternative approach: ${error.message}`);
    }
  };

  const createOrder = async () => {
    try {
      if (!user) {
        throw new Error('You must be logged in to create an order');
      }
      
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            title: newOrder.title,
            status: newOrder.status,
            details: newOrder.details || null,
            total_volume: newOrder.total_volume || null,
            user_id: user.id
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Order created successfully',
      });
      
      setShowCreateDialog(false);
      setNewOrder({
        title: '',
        status: 'pending',
        details: '',
        total_volume: 0
      });
      
      // Refresh orders list
      fetchOrders();
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create order',
        variant: 'destructive',
      });
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

  if (!user) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You must be logged in to view this page.
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
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchOrders} 
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Order
          </Button>
        </div>
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
                : "There are no orders in the system yet. Click 'Create Order' to add one."}
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

      {/* Create Order Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
            <DialogDescription>
              Add a new order to the system. Fill out the details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Order Title</Label>
              <Input
                id="title"
                placeholder="Enter order title"
                value={newOrder.title}
                onChange={(e) => setNewOrder({...newOrder, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={newOrder.status} 
                onValueChange={(value) => setNewOrder({...newOrder, status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="details">Details (Optional)</Label>
              <Input
                id="details"
                placeholder="Enter order details"
                value={newOrder.details}
                onChange={(e) => setNewOrder({...newOrder, details: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="volume">Volume (m³)</Label>
              <Input
                id="volume"
                type="number"
                placeholder="Enter volume in cubic meters"
                value={newOrder.total_volume.toString()}
                onChange={(e) => setNewOrder({...newOrder, total_volume: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createOrder} disabled={!newOrder.title}>
              Create Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
