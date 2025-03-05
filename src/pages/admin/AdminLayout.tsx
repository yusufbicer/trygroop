
import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  Users, 
  Package, 
  BarChart3, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Menu, 
  X
} from 'lucide-react';

const AdminLayout = () => {
  const { user, profile, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="min-h-screen bg-groop-darker text-white flex">
      {/* Sidebar for desktop */}
      <aside 
        className={`bg-groop-dark border-r border-white/10 fixed inset-y-0 left-0 z-20 transition-all duration-300 ease-in-out hidden lg:block
          ${isSidebarOpen ? 'w-64' : 'w-20'}`}
      >
        <div className="p-4 flex items-center justify-between border-b border-white/10 h-16">
          {isSidebarOpen ? (
            <Link to="/admin" className="text-groop-blue font-bold text-2xl">Admin</Link>
          ) : (
            <span className="text-groop-blue font-bold text-2xl mx-auto">A</span>
          )}
          <button 
            onClick={toggleSidebar} 
            className="text-white/70 hover:text-white transition-colors p-1"
          >
            <ChevronDown className={`h-5 w-5 transition-transform ${isSidebarOpen ? 'rotate-90' : '-rotate-90'}`} />
          </button>
        </div>

        <nav className="mt-4 px-3">
          <div className="space-y-1">
            <Link 
              to="/admin" 
              className="flex items-center px-3 py-2 text-white/80 hover:bg-white/5 rounded-md transition-colors"
            >
              <BarChart3 className="h-5 w-5 mr-3" />
              {isSidebarOpen && <span>Overview</span>}
            </Link>
            
            <Link 
              to="/admin/users" 
              className="flex items-center px-3 py-2 text-white/80 hover:bg-white/5 rounded-md transition-colors"
            >
              <Users className="h-5 w-5 mr-3" />
              {isSidebarOpen && <span>Users</span>}
            </Link>
            
            <Link 
              to="/admin/orders" 
              className="flex items-center px-3 py-2 text-white/80 hover:bg-white/5 rounded-md transition-colors"
            >
              <Package className="h-5 w-5 mr-3" />
              {isSidebarOpen && <span>Orders</span>}
            </Link>
          </div>
          
          <div className="mt-8 pt-4 border-t border-white/10">
            <Link 
              to="/admin/settings" 
              className="flex items-center px-3 py-2 text-white/80 hover:bg-white/5 rounded-md transition-colors"
            >
              <Settings className="h-5 w-5 mr-3" />
              {isSidebarOpen && <span>Settings</span>}
            </Link>
            
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center px-3 py-2 text-white/80 hover:bg-white/5 rounded-md transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              {isSidebarOpen && <span>Sign Out</span>}
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
              to="/admin" 
              className="flex items-center px-3 py-2 text-white/80 hover:bg-white/5 rounded-md transition-colors"
              onClick={closeMobileMenu}
            >
              <BarChart3 className="h-5 w-5 mr-3" />
              <span>Overview</span>
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
          </div>
          
          <div className="mt-8 pt-4 border-t border-white/10">
            <Link 
              to="/admin/settings" 
              className="flex items-center px-3 py-2 text-white/80 hover:bg-white/5 rounded-md transition-colors"
              onClick={closeMobileMenu}
            >
              <Settings className="h-5 w-5 mr-3" />
              <span>Settings</span>
            </Link>
            
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
      <main className={`flex-1 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} mt-16 lg:mt-0 transition-all duration-300`}>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
