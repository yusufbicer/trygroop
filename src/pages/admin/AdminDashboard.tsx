
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { UserPlus, PackageOpen, ShoppingBag, TruckIcon, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { CustomButton } from '@/components/ui/CustomButton';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [activeUsers, setActiveUsers] = useState(0);

  // Count total users
  const { data: usersCount = 0, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin-users-count'],
    queryFn: async () => {
      if (!isAdmin) return 0;
      
      try {
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        return count || 0;
      } catch (error: any) {
        toast({
          title: 'Error fetching user count',
          description: error.message,
          variant: 'destructive',
        });
        return 0;
      }
    },
    enabled: isAdmin
  });

  // Count total orders
  const { data: ordersCount = 0, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['admin-orders-count'],
    queryFn: async () => {
      if (!isAdmin) return 0;
      
      try {
        const { count, error } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        return count || 0;
      } catch (error: any) {
        toast({
          title: 'Error fetching orders count',
          description: error.message,
          variant: 'destructive',
        });
        return 0;
      }
    },
    enabled: isAdmin
  });

  // Count total suppliers
  const { data: suppliersCount = 0, isLoading: isLoadingSuppliers } = useQuery({
    queryKey: ['admin-suppliers-count'],
    queryFn: async () => {
      if (!isAdmin) return 0;
      
      try {
        const { count, error } = await supabase
          .from('suppliers')
          .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        return count || 0;
      } catch (error: any) {
        toast({
          title: 'Error fetching suppliers count',
          description: error.message,
          variant: 'destructive',
        });
        return 0;
      }
    },
    enabled: isAdmin
  });

  // Get orders by status
  const { data: ordersByStatus = [], isLoading: isLoadingOrdersByStatus } = useQuery({
    queryKey: ['admin-orders-by-status'],
    queryFn: async () => {
      if (!isAdmin) return [];
      
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('status')
          .order('created_at');
        
        if (error) throw error;
        
        // Count orders by status
        const statusCounts: Record<string, number> = {};
        data.forEach((order: { status: string }) => {
          statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
        });
        
        // Convert to array for chart
        return Object.entries(statusCounts).map(([status, count]) => ({
          status,
          count
        }));
      } catch (error: any) {
        toast({
          title: 'Error fetching orders by status',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
    },
    enabled: isAdmin
  });

  // Get recent orders
  const { data: recentOrders = [], isLoading: isLoadingRecentOrders } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: async () => {
      if (!isAdmin) return [];
      
      try {
        // Fix: Remove the profiles join and handle the user data separately
        const { data, error } = await supabase
          .from('orders')
          .select('id, title, status, created_at, user_id')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (error) throw error;
        
        // Now fetch profile information for each order's user_id
        const ordersWithProfiles = await Promise.all(
          (data || []).map(async (order) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', order.user_id)
              .single();
            
            return {
              ...order,
              profiles: profileData
            };
          })
        );
        
        return ordersWithProfiles || [];
      } catch (error: any) {
        toast({
          title: 'Error fetching recent orders',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
    },
    enabled: isAdmin
  });

  // Simulate active users
  useEffect(() => {
    setActiveUsers(Math.floor(Math.random() * 5) + 1);
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Admin Dashboard</h1>
          <p className="text-white/70">Overview of your platform</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold">
                {isLoadingUsers ? (
                  <div className="w-12 h-8 bg-white/10 animate-pulse rounded"></div>
                ) : (
                  usersCount
                )}
              </div>
              <div className="bg-blue-500/20 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-2 text-sm text-white/60">
              <span className="text-green-500">+{activeUsers}</span> active now
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold">
                {isLoadingOrders ? (
                  <div className="w-12 h-8 bg-white/10 animate-pulse rounded"></div>
                ) : (
                  ordersCount
                )}
              </div>
              <div className="bg-purple-500/20 p-3 rounded-full">
                <ShoppingBag className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-2 text-sm text-white/60">
              Across all users
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold">
                {isLoadingSuppliers ? (
                  <div className="w-12 h-8 bg-white/10 animate-pulse rounded"></div>
                ) : (
                  suppliersCount
                )}
              </div>
              <div className="bg-green-500/20 p-3 rounded-full">
                <TruckIcon className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className="mt-2 text-sm text-white/60">
              Registered suppliers
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold">
                {isLoadingOrdersByStatus ? (
                  <div className="w-12 h-8 bg-white/10 animate-pulse rounded"></div>
                ) : (
                  ordersByStatus.find((item) => item.status === 'pending')?.count || 0
                )}
              </div>
              <div className="bg-yellow-500/20 p-3 rounded-full">
                <PackageOpen className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
            <div className="mt-2 text-sm text-white/60">
              Require attention
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status Chart */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Orders by Status</CardTitle>
            <CardDescription>Distribution of orders by their current status</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingOrdersByStatus ? (
              <div className="h-[300px] w-full bg-white/5 animate-pulse rounded"></div>
            ) : ordersByStatus.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-white/50">
                No order data available
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ordersByStatus}
                    margin={{ top: 20, right: 30, left: 0, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" opacity={0.1} />
                    <XAxis dataKey="status" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#333', border: 'none' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="glass">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">Recent Orders</CardTitle>
                <CardDescription>Latest orders across the platform</CardDescription>
              </div>
              <Link to="/admin/orders">
                <CustomButton variant="outline" size="sm">View All</CustomButton>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingRecentOrders ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-white/5 animate-pulse rounded"></div>
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="py-8 text-center text-white/50">
                No orders available
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order: any) => (
                  <div key={order.id} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-white">{order.title}</h4>
                        <div className="text-sm text-white/70 mt-1">
                          <span>
                            {order.profiles && (
                              order.profiles.first_name || order.profiles.last_name
                                ? `${order.profiles.first_name || ''} ${order.profiles.last_name || ''}`
                                : 'User'
                            )}
                          </span>
                          <span className="mx-2">•</span>
                          <span>{formatDate(order.created_at)}</span>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium
                        ${order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 
                          order.status === 'completed' ? 'bg-green-500/20 text-green-500' : 
                          'bg-blue-500/20 text-blue-500'}`}
                      >
                        {order.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
