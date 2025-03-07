import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Profile } from '@/types/data';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any, data: any }>;
  signOut: () => Promise<void>;
  makeAdmin: (userId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          checkAdminStatus(session.user.id);
        } else {
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      // First, check if user_roles table exists
      const { error: tableCheckError } = await supabase
        .from('user_roles')
        .select('count(*)', { count: 'exact', head: true });
      
      if (tableCheckError && tableCheckError.code === '42P01') {
        // Table doesn't exist, user can't be admin
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }
      
      // Check if user is admin
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" error
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!data);
      }
    } catch (error) {
      console.error('Error in checkAdminStatus:', error);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const makeAdmin = async (userId: string): Promise<boolean> => {
    try {
      // First, check if user_roles table exists
      const { error: tableCheckError } = await supabase
        .from('user_roles')
        .select('count(*)', { count: 'exact', head: true });
      
      if (tableCheckError && tableCheckError.code === '42P01') {
        // Table doesn't exist, create it
        const { error: createTableError } = await supabase.rpc('create_user_roles_table');
        
        if (createTableError) {
          console.error('Error creating user_roles table:', createTableError);
          toast({
            title: 'Error',
            description: 'Failed to create user roles table',
            variant: 'destructive',
          });
          return false;
        }
      }
      
      // Check if the user already has an admin role
      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // Not a "no rows" error
        console.error('Error checking existing role:', checkError);
        toast({
          title: 'Error',
          description: 'Failed to check existing role',
          variant: 'destructive',
        });
        return false;
      }
      
      // If the user is already an admin, no need to insert
      if (existingRole) {
        // If this is the current user, update the state
        if (userId === user?.id) {
          setIsAdmin(true);
        }
        return true;
      }
      
      // Insert the admin role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: 'admin' }]);
      
      if (insertError) {
        console.error('Error making user admin:', insertError);
        toast({
          title: 'Error',
          description: 'Failed to assign admin role',
          variant: 'destructive',
        });
        return false;
      }
      
      // If this is the current user, update the state
      if (userId === user?.id) {
        setIsAdmin(true);
      }
      
      return true;
    } catch (error) {
      console.error('Error in makeAdmin:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (!error && data.user) {
        // Create a profile for the user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ id: data.user.id, email: email }]);
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }
      
      return { data, error };
    } catch (error) {
      console.error('Error signing up:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsAdmin(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        isLoading,
        signIn,
        signUp,
        signOut,
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
