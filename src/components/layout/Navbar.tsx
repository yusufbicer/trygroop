import React from 'react';
import { Link } from 'react-router-dom';
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

const Navbar: React.FC = () => {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Contact', href: '/#contact' },
];

  return (
    <nav className="bg-groop-darker py-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-white">
          Groop
        </Link>
        <ul className="flex items-center space-x-6">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link to={item.href} className="text-white hover:text-groop-blue">
                {item.label}
              </Link>
            </li>
          ))}
          {user ? (
            <li>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.email}`} alt={profile?.first_name || "Avatar"} />
                      <AvatarFallback>{profile?.first_name?.charAt(0).toUpperCase() || profile?.last_name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>Dashboard</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/orders')}>Admin</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={async () => {
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
                  }} disabled={loading}>
                    {loading ? 'Signing Out...' : 'Sign out'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          ) : (
            <li>
              <Link to="/auth">
                <Button>Sign In</Button>
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
