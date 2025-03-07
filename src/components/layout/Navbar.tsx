import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Menu, X, ChevronDown } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Contact', href: '/#contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-groop-surface/80 backdrop-blur-md py-3 shadow-lg shadow-groop-blue/5' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link to="/" className="flex items-center">
          <div className="relative">
            <span className="text-2xl font-bold bg-gradient-to-r from-groop-blue to-groop-cyan bg-clip-text text-transparent">
              GROOP
            </span>
            <div className="absolute -inset-1 bg-gradient-to-r from-groop-blue/20 to-groop-cyan/20 rounded-lg blur-sm -z-10"></div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          <ul className="flex items-center">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link 
                  to={item.href} 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? 'text-groop-accent bg-groop-surface/80'
                      : 'text-groop-accent-muted hover:text-groop-accent hover:bg-groop-surface/50'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {user ? (
            <div className="ml-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 px-3 py-2 rounded-lg bg-groop-surface/50 hover:bg-groop-surface/80 border border-groop-blue/10 hover:border-groop-blue/30 transition-all duration-300">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2 ring-2 ring-groop-blue/20">
                        <AvatarImage src={profile?.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.email}`} alt={profile?.first_name || "Avatar"} />
                        <AvatarFallback className="bg-groop-blue text-white text-xs">
                          {profile?.first_name?.charAt(0).toUpperCase() || profile?.last_name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-groop-accent mr-1">
                        {profile?.first_name || 'Account'}
                      </span>
                      <ChevronDown className="h-4 w-4 text-groop-accent-muted" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-groop-surface border border-groop-blue/20 backdrop-blur-md" align="end" forceMount>
                  <DropdownMenuLabel className="text-groop-accent">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-groop-blue/10" />
                  <DropdownMenuItem 
                    onClick={() => navigate('/dashboard')}
                    className="text-groop-accent-muted hover:text-groop-accent hover:bg-groop-blue/10 cursor-pointer"
                  >
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate('/profile')}
                    className="text-groop-accent-muted hover:text-groop-accent hover:bg-groop-blue/10 cursor-pointer"
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate('/admin/orders')}
                    className="text-groop-accent-muted hover:text-groop-accent hover:bg-groop-blue/10 cursor-pointer"
                  >
                    Admin
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-groop-blue/10" />
                  <DropdownMenuItem 
                    onClick={async () => {
                      try {
                        await signOut();
                        navigate('/auth');
                        toast({
                          title: "Signed out",
                          description: "You have been successfully signed out."
                        });
                      } catch (error) {
                        toast({
                          variant: "destructive",
                          title: "Oh no! Something went wrong.",
                          description: "There was a problem signing you out. Please try again."
                        });
                      }
                    }} 
                    disabled={loading}
                    className="text-groop-accent-muted hover:text-groop-accent hover:bg-groop-blue/10 cursor-pointer"
                  >
                    {loading ? 'Signing Out...' : 'Sign out'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="ml-4">
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-groop-blue to-groop-cyan hover:from-groop-cyan hover:to-groop-blue text-white border-none shadow-md shadow-groop-blue/20">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-groop-accent hover:bg-groop-surface/50"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-groop-surface/95 backdrop-blur-md border-t border-groop-blue/10 animate-fade-in">
          <div className="container mx-auto px-4 py-4">
            <ul className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link 
                    to={item.href} 
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isActive(item.href)
                        ? 'text-groop-accent bg-groop-blue/10'
                        : 'text-groop-accent-muted hover:text-groop-accent hover:bg-groop-surface/80'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {!user && (
                <li className="pt-2">
                  <Link 
                    to="/auth" 
                    className="block w-full px-4 py-3 rounded-lg text-center text-white font-medium bg-gradient-to-r from-groop-blue to-groop-cyan"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
