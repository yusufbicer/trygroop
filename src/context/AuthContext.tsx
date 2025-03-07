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
      console.log('Attempting to make user admin:', userId);
      
      // Try the simplest approach first - direct insert
      try {
        console.log('Trying direct insert to user_roles table');
        const { error: directInsertError } = await supabase
          .from('user_roles')
          .upsert([
            { user_id: userId, role: 'admin' }
          ]);
        
        if (!directInsertError) {
          console.log('Admin role assigned successfully with direct insert');
          setIsAdmin(true);
          toast({
            title: 'Admin Access Granted',
            description: 'You now have administrator privileges.',
          });
          return;
        } else {
          console.error('Error with direct insert:', directInsertError);
        }
      } catch (error) {
        console.error('Exception with direct insert:', error);
      }
      
      // If direct insert failed, try to create the table first
      try {
        console.log('Trying to create user_roles table');
        const { error: createTableError } = await supabase.rpc(
          'create_user_roles_table',
          {}
        );
        
        if (createTableError) {
          console.error('Error creating user_roles table with function:', createTableError);
        } else {
          console.log('Successfully created user_roles table');
          
          // Try insert again after creating the table
          const { error: insertAfterCreateError } = await supabase
            .from('user_roles')
            .upsert([
              { user_id: userId, role: 'admin' }
            ]);
          
          if (!insertAfterCreateError) {
            console.log('Admin role assigned successfully after creating table');
            setIsAdmin(true);
            toast({
              title: 'Admin Access Granted',
              description: 'You now have administrator privileges.',
            });
            return;
          } else {
            console.error('Error inserting after table creation:', insertAfterCreateError);
          }
        }
      } catch (error) {
        console.error('Exception creating user_roles table:', error);
      }
      
      // Last resort: Use raw SQL via REST API
      try {
        console.log('Trying raw SQL via REST API');
        
        // Create a function to execute SQL if it doesn't exist
        const createFunctionSql = `
          CREATE OR REPLACE FUNCTION public.create_user_roles_table()
          RETURNS void
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            -- Create user_roles table if it doesn't exist
            CREATE TABLE IF NOT EXISTS public.user_roles (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID NOT NULL,
              role TEXT NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
              UNIQUE(user_id, role)
            );

            -- Enable RLS on user_roles table
            ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

            -- Drop existing policies if they exist
            DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
            DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;
            DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;
            DROP POLICY IF EXISTS "Users can delete their own roles" ON public.user_roles;
            
            -- Create policies that allow users to manage their own roles
            CREATE POLICY "Users can view their own roles"
              ON public.user_roles
              FOR SELECT
              USING (auth.uid() = user_id);

            CREATE POLICY "Users can insert their own roles"
              ON public.user_roles
              FOR INSERT
              WITH CHECK (auth.uid() = user_id);

            CREATE POLICY "Users can update their own roles"
              ON public.user_roles
              FOR UPDATE
              USING (auth.uid() = user_id);

            CREATE POLICY "Users can delete their own roles"
              ON public.user_roles
              FOR DELETE
              USING (auth.uid() = user_id);
            
            -- Insert admin role for the specified user
            INSERT INTO public.user_roles (user_id, role)
            VALUES ('${userId}', 'admin')
            ON CONFLICT (user_id, role) DO NOTHING;
          END;
          $$;
        `;
        
        // Execute the SQL via REST API
        const response = await fetch(`${supabase.supabaseUrl}/rest/v1/rpc/create_user_roles_table`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${supabase.supabaseKey}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({})
        });
        
        if (response.ok) {
          console.log('Successfully created user_roles table and assigned admin role via REST API');
          setIsAdmin(true);
          toast({
            title: 'Admin Access Granted',
            description: 'You now have administrator privileges.',
          });
          return;
        } else {
          const errorData = await response.json();
          console.error('Error with REST API call:', errorData);
          throw new Error(`REST API error: ${JSON.stringify(errorData)}`);
        }
      } catch (error) {
        console.error('Exception with REST API approach:', error);
        throw error;
      }
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
