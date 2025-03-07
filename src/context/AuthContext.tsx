import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Profile } from '@/types/data';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: { first_name?: string; last_name?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshSession: () => Promise<void>;
  makeAdmin: (userId: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        checkAdminRole(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        checkAdminRole(session.user.id);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const checkAdminRole = async (userId: string) => {
    try {
      // First, check if user_roles table exists by trying to select from it
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        // If the table doesn't exist, check if this is the first user
        if (error.code === '42P01') { // Table doesn't exist error
          console.log('user_roles table does not exist, checking if first user');
          await checkFirstUser(userId);
          return;
        }
        
        console.error('Error checking admin role:', error);
        return;
      }

      setIsAdmin(!!data);
      
      // If no admin role found, check if this is the first user
      if (!data) {
        await checkFirstUser(userId);
      }
    } catch (error) {
      console.error('Error checking admin role:', error);
    }
  };
  
  const checkFirstUser = async (userId: string) => {
    try {
      // Check if this is the first user by counting profiles
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Error counting profiles:', error);
        return;
      }
      
      // If this is the first or only user, make them an admin
      if (count === 1) {
        console.log('First user detected, making admin');
        await makeAdmin(userId);
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Error checking if first user:', error);
    }
  };
  
  const makeAdmin = async (userId: string) => {
    try {
      // First try to create the user_roles table if it doesn't exist
      try {
        await supabase.rpc('create_orders_table'); // This also creates user_roles table
      } catch (error) {
        console.error('Error creating tables:', error);
        // Continue anyway, as the table might already exist
      }
      
      // Insert admin role for the user
      const { error } = await supabase
        .from('user_roles')
        .upsert([
          { user_id: userId, role: 'admin' }
        ]);
      
      if (error) {
        if (error.code === '23505') { // Unique violation - role already exists
          console.log('User already has admin role');
          setIsAdmin(true);
          return;
        }
        throw error;
      }
      
      console.log('Admin role assigned successfully');
      setIsAdmin(true);
      
      toast({
        title: 'Admin Access Granted',
        description: 'You now have administrator privileges.',
      });
    } catch (error: any) {
      console.error('Error making user admin:', error);
      toast({
        title: 'Error',
        description: `Failed to assign admin role: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    metadata?: { first_name?: string; last_name?: string }
  ) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      if (error) throw error;
      toast({
        title: 'Sign up successful',
        description: 'Please check your email for confirmation.',
      });
    } catch (error: any) {
      toast({
        title: 'Sign up failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error);
        toast({
          title: "Error signing out",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      // Force clear session and user state
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      
      // Successfully signed out
      toast({
        title: "Signed out",
        description: "You have been successfully signed out."
      });
    } catch (error) {
      console.error("Unexpected error during sign out:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) throw new Error('No user logged in');

      // Use type assertion to bypass TypeScript checks completely
      const { error } = await (supabase.from('profiles') as any)
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setProfile({
        ...profile,
        ...updates,
      } as Profile);

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error updating profile',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      setSession(data.session);
      setUser(data.session?.user ?? null);
    } catch (error: any) {
      console.error('Error refreshing session:', error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isAdmin,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshSession,
        makeAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
