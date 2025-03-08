
import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Truck, 
  LogOut, 
  Menu, 
  X,
  Home,
  FileEdit,
  PenLine
} from 'lucide-react';

const AdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="min-h-screen bg-groop-darker text-white flex">
      {/* Sidebar for desktop */}
      <aside className="bg-groop-dark border-r border-white/10 h-full fixed inset-y-0 left-0 z-10 w-64 hidden lg:block">
        <div className="p-4 flex items-center justify-between border-b border-white/10 h-16">
          <Link to="/admin" className="text-groop-blue font-bold text-2xl">Admin</Link>
        </div>

        <nav className="mt-4 px-3">
          <div className="space-y-1">
            <Link 
              to="/" 
              className="flex items-center px-3 py-2 text-white/80 hover:bg-white/5 rounded-md transition-colors"
            >
              <Home className="h-5 w-5 mr-3" />
              <span>Home</span>
            </Link>
            
            <Link 
              to="/admin" 
              className="flex items-center px-3 py-2 text-white/80 hover:bg-white/5 rounded-md transition-colors"
            >
              <LayoutDashboard className="h-5 w-5 mr-3" />
              <span>Dashboard</span>
            </Link>
            
            <Link 
              to="/admin/users" 
              className="flex items-center px-3 py-2 text-white/80 hover:bg-white/5 rounded-md transition-colors"
            >
              <Users className="h-5 w-5 mr-3" />
              <span>Users</span>
            </Link>
            
            <Link 
              to="/admin/orders" 
              className="flex items-center px-3 py-2 text-white/80 hover:bg-white/5 rounded-md transition-colors"
            >
              <Package className="h-5 w-5 mr-3" />
              <span>Orders</span>
            </Link>
            
            <Link 
              to="/admin/suppliers" 
              className="flex items-center px-3 py-2 text-white/80 hover:bg-white/5 rounded-md transition-colors"
            >
              <Truck className="h-5 w-5 mr-3" />
              <span>Suppliers</span>
            </Link>
            
            <Link 
              to="/admin/blog" 
              className="flex items-center px-3 py-2 text-white/80 hover:bg-white/5 rounded-md transition-colors"
            >
              <PenLine className="h-5 w-5 mr-3" />
              <span>Blog</span>
            </Link>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 px-3 pb-4">
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center px-3 py-2 mt-4 text-white/80 hover:bg-white/5 rounded-md transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 bg-groop-dark border-b border-white/10 h-16 flex items-center justify-between px-4 lg:hidden z-20">
        <div className="flex items-center">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="text-white/70 hover:text-white mr-4"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <Link to="/admin" className="text-groop-blue font-bold text-2xl">Admin</Link>
        </div>
        
        <div className="flex items-center">
          <span className="text-white/80">
            {profile?.first_name || user?.email}
          </span>
        </div>
      </div>

      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-10 lg:hidden" onClick={closeMobileMenu}></div>
      )}
      
      <nav 
        className={`fixed top-16 left-0 h-full z-10 w-64 bg-groop-dark border-r border-white/10 transform transition-transform lg:hidden
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="py-4 px-3">
          <div className="space-y-1">
            <Link 
              to="/" 
              className="flex items-center px-3 py-2 text-white/80 hover:bg-white/5 rounded-md transition-colors"
              onClick={closeMobileMenu}
            >
              <Home className="h-5 w-5 mr-3" />
              <span>Home</span>
            </Link>
            
            <Link 
              to="/admin" 
              className="flex items-center px-3 py-2 text-white/80 hover:bg-white/5 rounded-md transition-colors"
              onClick={closeMobileMenu}
            >
              <LayoutDashboard className="h-5 w-5 mr-3" />
              <span>Dashboard</span>
            </Link>
            
            <Link 
              to="/admin/users" 
              className="flex items-center px-3 py-2 text-white/80 hover:bg-white/5 rounded-md transition-colors"
              onClick={closeMobileMenu}
            >
              <Users className="h-5 w-5 mr-3" />
              <span>Users</span>
            </Link>
            
            <Link 
              to="/admin/orders" 
              className="flex items-center px-3 py-2 text-white/80 hover:bg-white/5 rounded-md transition-colors"
              onClick={closeMobileMenu}
            >
              <Package className="h-5 w-5 mr-3" />
              <span>Orders</span>
            </Link>
            
            <Link 
              to="/admin/suppliers" 
              className="flex items-center px-3 py-2 text-white/80 hover:bg-white/5 rounded-md transition-colors"
              onClick={closeMobileMenu}
            >
              <Truck className="h-5 w-5 mr-3" />
              <span>Suppliers</span>
            </Link>
            
            <Link 
              to="/admin/blog" 
              className="flex items-center px-3 py-2 text-white/80 hover:bg-white/5 rounded-md transition-colors"
              onClick={closeMobileMenu}
            >
              <PenLine className="h-5 w-5 mr-3" />
              <span>Blog</span>
            </Link>
          </div>
          
          <div className="mt-8 pt-4 border-t border-white/10">
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center px-3 py-2 text-white/80 hover:bg-white/5 rounded-md transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 mt-16 lg:mt-0">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
