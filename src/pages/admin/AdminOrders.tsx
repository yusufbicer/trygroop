
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '@/hooks/useOrders';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CustomButton } from '@/components/ui/CustomButton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Package, Search, MoreHorizontal, Filter, Eye, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types/data'; // Make sure to import Order type

const AdminOrders = () => {
  const navigate = useNavigate();
  const { orders, isLoading, deleteOrder } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const { toast } = useToast();
  
  // Status filter
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  // Update filtered orders when search term, status filter, or orders change
  useEffect(() => {
    let result = [...orders];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter((order) =>
        order.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      result = result.filter((order) =>
        order.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter]);

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

  const handleViewOrder = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrder.mutateAsync(orderId);
      toast({
        title: 'Success',
        description: 'Order deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete order',
        variant: 'destructive',
      });
    }
  };
  
  // Function to handle filter selection
  const handleFilterSelect = (status: string | null) => {
    setStatusFilter(status);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Manage Orders</h1>
          <p className="text-white/70">View and manage all user orders</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-4 sm:space-y-0">
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
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <CustomButton variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" /> Filter: {statusFilter || 'All'}
              </CustomButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleFilterSelect(null)}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterSelect('pending')}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterSelect('processing')}>
                Processing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterSelect('shipping')}>
                Shipping
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterSelect('completed')}>
                Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-groop-blue"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-10 text-center">
            <Package className="h-12 w-12 text-white/30 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-white mb-1">No orders found</h3>
            <p className="text-white/70 mb-4">
              {searchTerm || statusFilter ? "No orders match your filter criteria" : "There are no orders in the system"}
            </p>
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
                  <TableHead>Title</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.title}</TableCell>
                    <TableCell>{order.user_id}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell>{order.total_volume ? `${order.total_volume} m³` : '-'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewOrder(order.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteOrder(order.id)}>
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
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
