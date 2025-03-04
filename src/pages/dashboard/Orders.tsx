
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { CustomButton } from '@/components/ui/CustomButton';
import { Plus, Package, Search, ChevronRight, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { orders, isLoading } = useOrders(user?.id);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter((order) => 
    order.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Status badge color
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

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Orders</h1>
          <p className="text-white/70">Manage and track your import orders</p>
        </div>
        <CustomButton 
          variant="primary" 
          size="sm" 
          className="mt-4 sm:mt-0" 
          onClick={() => navigate('/dashboard/orders/create')}
        >
          <Plus className="h-4 w-4 mr-2" /> Create Order
        </CustomButton>
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
          <CustomButton variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </CustomButton>
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
              {searchTerm 
                ? "No orders match your search criteria" 
                : "You haven't created any orders yet"}
            </p>
            <CustomButton 
              variant="secondary" 
              onClick={() => navigate('/dashboard/orders/create')}
            >
              <Plus className="h-4 w-4 mr-2" /> Create Your First Order
            </CustomButton>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Your Orders</CardTitle>
            <CardDescription>You have {filteredOrders.length} orders total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id}>
                  <Link 
                    to={`/dashboard/orders/${order.id}`}
                    className="block p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-medium text-white mr-3">{order.title}</h3>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-white/70 text-sm mt-1">{formatDate(order.created_at)}</p>
                      </div>
                      <div className="flex items-center mt-2 sm:mt-0">
                        {order.total_volume && (
                          <span className="text-white/70 text-sm mr-4">
                            {order.total_volume} m³
                          </span>
                        )}
                        <ChevronRight className="h-5 w-5 text-white/50" />
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Orders;
