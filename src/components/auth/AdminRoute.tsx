
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // This effect is empty but useful for debugging if needed
  }, [user, isAdmin, loading]);

  if (loading) {
    // Return a loading spinner or skeleton while checking authentication
    return (
      <div className="min-h-screen flex items-center justify-center bg-groop-darker">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-groop-blue"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to the auth page if not authenticated
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    // Redirect to the dashboard if not an admin
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  // If authenticated and an admin, render the protected content
  return <>{children}</>;
};

export default AdminRoute;
