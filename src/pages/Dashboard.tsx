
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CustomButton } from '@/components/ui/CustomButton';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  CreditCard, 
  PlusCircle, 
  ArrowRight,
  Clock
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [hasSuppliers, setHasSuppliers] = useState(false);

  // Fetch user's orders
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['dashboard-orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await (supabase.from('orders') as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) {
        console.error('Error fetching orders:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user
  });

  // Check if user has any suppliers
  useEffect(() => {
    const checkSuppliers = async () => {
      if (!user) return;
      
      try {
        const { count, error } = await (supabase.from('suppliers') as any)
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        setHasSuppliers(count > 0);
      } catch (error) {
        console.error('Error checking suppliers:', error);
      }
    };
    
    checkSuppliers();
  }, [user]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Status badge color
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

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-groop-darker">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-groop-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-groop-darker">
      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">
            Welcome, {profile?.first_name || user.email?.split('@')[0]}
          </h1>
          <p className="text-white/70">
            Manage your imports from Turkey all in one place.
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass p-6 flex flex-col items-center">
            <div className="bg-groop-blue/10 rounded-full p-3 mb-4">
              <Package className="h-6 w-6 text-groop-blue" />
            </div>
            <h3 className="text-white font-medium mb-1">Orders</h3>
            <p className="text-3xl font-bold text-white">
              {isLoadingOrders ? (
                <span className="inline-block w-5 h-6 bg-white/10 animate-pulse rounded"></span>
              ) : (
                orders.length
              )}
            </p>
          </Card>
          
          <Card className="glass p-6 flex flex-col items-center">
            <div className="bg-groop-blue/10 rounded-full p-3 mb-4">
              <Truck className="h-6 w-6 text-groop-blue" />
            </div>
            <h3 className="text-white font-medium mb-1">In Transit</h3>
            <p className="text-3xl font-bold text-white">
              {isLoadingOrders ? (
                <span className="inline-block w-5 h-6 bg-white/10 animate-pulse rounded"></span>
              ) : (
                orders.filter(order => order.status === 'shipping').length
              )}
            </p>
          </Card>
          
          <Card className="glass p-6 flex flex-col items-center">
            <div className="bg-groop-blue/10 rounded-full p-3 mb-4">
              <Clock className="h-6 w-6 text-groop-blue" />
            </div>
            <h3 className="text-white font-medium mb-1">Pending</h3>
            <p className="text-3xl font-bold text-white">
              {isLoadingOrders ? (
                <span className="inline-block w-5 h-6 bg-white/10 animate-pulse rounded"></span>
              ) : (
                orders.filter(order => order.status === 'pending').length
              )}
            </p>
          </Card>
          
          <Card className="glass p-6 flex flex-col items-center">
            <div className="bg-groop-blue/10 rounded-full p-3 mb-4">
              <CheckCircle2 className="h-6 w-6 text-groop-blue" />
            </div>
            <h3 className="text-white font-medium mb-1">Completed</h3>
            <p className="text-3xl font-bold text-white">
              {isLoadingOrders ? (
                <span className="inline-block w-5 h-6 bg-white/10 animate-pulse rounded"></span>
              ) : (
                orders.filter(order => order.status === 'completed').length
              )}
            </p>
          </Card>
        </div>
        
        {/* Get Started Section */}
        <Card className="glass p-8 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Get Started with Groop</h2>
          <p className="text-white/70 mb-6">
            Complete these steps to start consolidating your imports from Turkey.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5">
              <div className="bg-groop-blue/10 rounded-full p-2 mt-1">
                <CheckCircle2 className="h-5 w-5 text-groop-blue" />
              </div>
              <div>
                <h3 className="font-medium text-white">Create Your Account</h3>
                <p className="text-white/70 text-sm">
                  You've successfully created your account and can now access all features.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5">
              <div className={hasSuppliers ? "bg-groop-blue/10 rounded-full p-2 mt-1" : "bg-white/10 rounded-full p-2 mt-1"}>
                {hasSuppliers ? (
                  <CheckCircle2 className="h-5 w-5 text-groop-blue" />
                ) : (
                  <PlusCircle className="h-5 w-5 text-white/70" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-white">Add Your Suppliers</h3>
                <p className="text-white/70 text-sm">
                  Add your Turkish suppliers to easily create and manage orders.
                </p>
                {!hasSuppliers && (
                  <CustomButton variant="secondary" size="sm" className="mt-2" onClick={() => navigate('/dashboard/suppliers')}>
                    Add Suppliers
                  </CustomButton>
                )}
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5">
              <div className={orders.length > 0 ? "bg-groop-blue/10 rounded-full p-2 mt-1" : "bg-white/10 rounded-full p-2 mt-1"}>
                {orders.length > 0 ? (
                  <CheckCircle2 className="h-5 w-5 text-groop-blue" />
                ) : (
                  <PlusCircle className="h-5 w-5 text-white/70" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-white">Create Your First Order</h3>
                <p className="text-white/70 text-sm">
                  Start consolidating by creating your first order with one or more suppliers.
                </p>
                {orders.length === 0 && (
                  <CustomButton variant="secondary" size="sm" className="mt-2" onClick={() => navigate('/dashboard/orders/create')}>
                    Create Order
                  </CustomButton>
                )}
              </div>
            </div>
          </div>
        </Card>
        
        {/* Recent Activity */}
        <Card className="glass p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Recent Orders</h2>
            <Link to="/dashboard/orders">
              <CustomButton variant="outline" size="sm">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </CustomButton>
            </Link>
          </div>
          
          {isLoadingOrders ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-white/5 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/70">
                No orders to display. Start by creating your first order.
              </p>
              <CustomButton variant="secondary" className="mt-4" onClick={() => navigate('/dashboard/orders/create')}>
                <PlusCircle className="mr-2 h-4 w-4" /> Create Order
              </CustomButton>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <Link 
                  key={order.id} 
                  to={`/dashboard/orders/${order.id}`}
                  className="block hover:bg-white/5 transition-colors rounded-lg"
                >
                  <div className="p-4 border border-white/10 rounded-lg">
                    <div className="flex flex-col sm:flex-row justify-between">
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-medium text-white">{order.title}</h3>
                          <span className={`ml-3 px-2 py-1 text-xs rounded-full ${getStatusColorClass(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-white/60 text-sm mt-1">
                          Created: {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center mt-2 sm:mt-0">
                        <ArrowRight className="h-5 w-5 text-white/40" />
                      </div>
                    </div>
                    {order.details && (
                      <p className="text-white/70 text-sm mt-2 line-clamp-1">
                        {order.details}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
