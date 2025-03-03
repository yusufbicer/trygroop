
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomButton } from '@/components/ui/CustomButton';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Package, Truck, CreditCard, PlusCircle } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-groop-darker">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-groop-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-groop-darker">
      {/* Dashboard Header */}
      <header className="bg-groop-dark border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span onClick={() => navigate('/')} className="cursor-pointer text-groop-blue font-bold text-2xl">Groop</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white/70">
                Welcome, {profile.first_name || user.email}
              </span>
              <CustomButton variant="outline" size="sm" onClick={() => signOut()}>
                Sign Out
              </CustomButton>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-white mb-8">Dashboard</h1>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass p-6 flex flex-col items-center">
            <div className="bg-groop-blue/10 rounded-full p-3 mb-4">
              <Package className="h-6 w-6 text-groop-blue" />
            </div>
            <h3 className="text-white font-medium mb-1">Orders</h3>
            <p className="text-3xl font-bold text-white">0</p>
          </Card>
          
          <Card className="glass p-6 flex flex-col items-center">
            <div className="bg-groop-blue/10 rounded-full p-3 mb-4">
              <Truck className="h-6 w-6 text-groop-blue" />
            </div>
            <h3 className="text-white font-medium mb-1">Shipments</h3>
            <p className="text-3xl font-bold text-white">0</p>
          </Card>
          
          <Card className="glass p-6 flex flex-col items-center">
            <div className="bg-groop-blue/10 rounded-full p-3 mb-4">
              <CreditCard className="h-6 w-6 text-groop-blue" />
            </div>
            <h3 className="text-white font-medium mb-1">Payments</h3>
            <p className="text-3xl font-bold text-white">0</p>
          </Card>
          
          <Card className="glass p-6 flex flex-col items-center">
            <div className="bg-groop-blue/10 rounded-full p-3 mb-4">
              <CheckCircle2 className="h-6 w-6 text-groop-blue" />
            </div>
            <h3 className="text-white font-medium mb-1">Suppliers</h3>
            <p className="text-3xl font-bold text-white">0</p>
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
              <div className="bg-white/10 rounded-full p-2 mt-1">
                <PlusCircle className="h-5 w-5 text-white/70" />
              </div>
              <div>
                <h3 className="font-medium text-white">Add Your Suppliers</h3>
                <p className="text-white/70 text-sm">
                  Add your Turkish suppliers to easily create and manage orders.
                </p>
                <CustomButton variant="secondary" size="sm" className="mt-2">
                  Add Suppliers
                </CustomButton>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5">
              <div className="bg-white/10 rounded-full p-2 mt-1">
                <PlusCircle className="h-5 w-5 text-white/70" />
              </div>
              <div>
                <h3 className="font-medium text-white">Create Your First Order</h3>
                <p className="text-white/70 text-sm">
                  Start consolidating by creating your first order with one or more suppliers.
                </p>
                <CustomButton variant="secondary" size="sm" className="mt-2">
                  Create Order
                </CustomButton>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Recent Activity */}
        <Card className="glass p-8">
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          <div className="text-center py-8">
            <p className="text-white/70">
              No recent activity to display. Start by adding suppliers and creating orders.
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
