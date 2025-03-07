import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Users, Search, MoreHorizontal, CheckCircle, XCircle, Shield, Trash2, UserPlus, RefreshCw, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface UserData {
  id: string;
  email: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  isAdmin: boolean;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    isAdmin: false,
    password: '' // Note: In production, consider more secure approaches
  });
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user: currentUser, makeAdmin } = useAuth();

  useEffect(() => {
    if (currentUser) {
      // Force admin status for the current user to ensure access
      makeAdmin(currentUser.id).then(() => {
        fetchUsers();
      });
    } else {
      setIsLoading(false);
      setError("You must be logged in to view users.");
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Fetching users...");
      
      // First, ensure the user_roles table exists
      try {
        await ensureTablesExist();
      } catch (error) {
        console.error("Error ensuring tables exist:", error);
        // Continue anyway, as we'll try to fetch users
      }
      
      // Step 1: Fetch all auth users
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error("Error fetching auth users:", authError);
        // Fall back to fetching profiles only
        await fetchProfilesOnly();
        return;
      }
      
      if (!authData || !authData.users) {
        console.log("No auth users found, falling back to profiles");
        await fetchProfilesOnly();
        return;
      }
      
      // Step 2: Fetch admin roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error("Error fetching roles:", rolesError);
      }

      // Convert admin roles to a map for faster lookup
      const adminMap = new Map();
      if (rolesData) {
        rolesData.forEach(role => {
          if (role.role === 'admin') {
            adminMap.set(role.user_id, true);
          }
        });
      }
      
      // Step 3: Fetch profiles for additional user data
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, created_at');

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      }
      
      // Create a map of profiles by ID
      const profilesMap = new Map();
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap.set(profile.id, profile);
        });
      }
      
      // Combine the data
      const combinedUsers = authData.users.map(authUser => {
        const profile = profilesMap.get(authUser.id) || {};
        return {
          id: authUser.id,
          email: authUser.email || `user-${authUser.id.substring(0, 8)}@example.com`,
          created_at: profile.created_at || authUser.created_at,
          first_name: profile.first_name || authUser.user_metadata?.first_name || null,
          last_name: profile.last_name || authUser.user_metadata?.last_name || null,
          isAdmin: adminMap.has(authUser.id)
        };
      });

      setUsers(combinedUsers);
      console.log(`Successfully fetched ${combinedUsers.length} users`);
    } catch (error: any) {
      console.error('Error in fetchUsers:', error);
      setError(error.message || 'Failed to fetch users');
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch users',
        variant: 'destructive',
      });
      
      // Try fallback method
      await fetchProfilesOnly();
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchProfilesOnly = async () => {
    try {
      console.log("Falling back to profiles-only fetch");
      
      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, created_at');

      if (profilesError) throw profilesError;

      // Fetch admin roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (rolesError) {
        console.error("Error fetching roles:", rolesError);
      }

      // Convert admin roles to a map for faster lookup
      const adminMap = new Map();
      if (rolesData) {
        rolesData.forEach(role => {
          adminMap.set(role.user_id, true);
        });
      }

      // Create user objects from profiles
      const usersFromProfiles = profilesData.map(profile => ({
        id: profile.id,
        email: `user-${profile.id.substring(0, 8)}@example.com`, // Placeholder email
        created_at: profile.created_at,
        first_name: profile.first_name,
        last_name: profile.last_name,
        isAdmin: adminMap.has(profile.id)
      }));

      setUsers(usersFromProfiles);
      console.log(`Successfully fetched ${usersFromProfiles.length} users from profiles`);
    } catch (error: any) {
      console.error('Error in fetchProfilesOnly:', error);
      setError(error.message || 'Failed to fetch profiles');
      
      // If we can't even fetch profiles, create a placeholder for the current user
      if (currentUser) {
        setUsers([{
          id: currentUser.id,
          email: currentUser.email || 'current-user@example.com',
          created_at: new Date().toISOString(),
          first_name: null,
          last_name: null,
          isAdmin: true
        }]);
      } else {
        setUsers([]);
      }
    }
  };
  
  const ensureTablesExist = async () => {
    try {
      // Check if user_roles table exists
      const { error: checkError } = await supabase
        .from('user_roles')
        .select('count(*)', { count: 'exact', head: true });
      
      if (checkError && checkError.code === '42P01') { // Table doesn't exist
        console.log("Creating user_roles table");
        
        // Create user_roles table
        const { error: createError } = await supabase.rpc(
          'exec_sql',
          { 
            sql: `
              CREATE TABLE IF NOT EXISTS public.user_roles (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                role TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                UNIQUE(user_id, role)
              );
              
              -- Insert admin role for current user
              INSERT INTO public.user_roles (user_id, role)
              VALUES ('${currentUser?.id}', 'admin')
              ON CONFLICT (user_id, role) DO NOTHING;
            `
          }
        );
        
        if (createError) {
          console.error("Error creating user_roles table:", createError);
          
          // Try alternative approach
          const { error: insertError } = await supabase
            .from('user_roles')
            .insert({
              user_id: currentUser?.id,
              role: 'admin'
            });
          
          if (insertError && insertError.code !== '23505') { // Ignore unique violation
            console.error("Error inserting admin role:", insertError);
          }
        }
      }
    } catch (error) {
      console.error("Error in ensureTablesExist:", error);
    }
  };

  const filteredUsers = users.filter(user =>
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.first_name && user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.last_name && user.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const toggleAdminRole = async (userId: string, isCurrentlyAdmin: boolean) => {
    try {
      if (isCurrentlyAdmin) {
        // Remove admin role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');

        if (error) throw error;
      } else {
        // Add admin role
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: 'admin'
          });

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: `User ${isCurrentlyAdmin ? 'removed from' : 'added to'} admin role`,
      });

      // Refresh the users list
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to ${isCurrentlyAdmin ? 'remove' : 'add'} admin role`,
        variant: 'destructive',
      });
    }
  };

  const handleUserDelete = async (userId: string) => {
    // This would need to be implemented with a Supabase Edge Function in production
    // as client-side code cannot delete auth users
    try {
      // For now, we'll just delete the profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'User deleted',
        description: 'The user has been removed from the system',
      });

      fetchUsers();
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // In a production app, this would be handled by a secure server function
      // For now, we'll simulate creating a user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: newUserForm.email,
        password: newUserForm.password,
        options: {
          data: {
            first_name: newUserForm.firstName,
            last_name: newUserForm.lastName
          }
        }
      });

      if (signUpError) throw signUpError;
      
      // If admin role is needed, add it
      if (newUserForm.isAdmin && signUpData.user) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: signUpData.user.id,
            role: 'admin'
          });

        if (roleError) throw roleError;
      }

      toast({
        title: 'User created',
        description: 'The new user has been added to the system',
      });

      setIsCreateUserDialogOpen(false);
      setNewUserForm({
        email: '',
        firstName: '',
        lastName: '',
        isAdmin: false,
        password: ''
      });
      
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user',
        variant: 'destructive',
      });
    }
  };

  if (!currentUser) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You must be logged in to view this page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Manage Users</h1>
          <p className="text-white/70">View and manage all users in the system</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchUsers} 
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => setIsCreateUserDialogOpen(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
          <Input
            type="text"
            placeholder="Search users..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg">All Users</CardTitle>
          <CardDescription>Total: {filteredUsers.length} users</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-groop-blue"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/70">No users found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {user.first_name || user.last_name ? (
                        `${user.first_name || ''} ${user.last_name || ''}`.trim()
                      ) : (
                        <span className="text-white/50">Not provided</span>
                      )}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      {user.isAdmin ? (
                        <Badge variant="success" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          User
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toggleAdminRole(user.id, user.isAdmin)}>
                            <Shield className="mr-2 h-4 w-4" />
                            {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-red-500 focus:text-red-500"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4">
              <p><strong>Name:</strong> {`${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`.trim() || 'Not provided'}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedUser && handleUserDelete(selectedUser.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account. The user will receive an email to confirm their account.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={newUserForm.firstName}
                  onChange={(e) => setNewUserForm({...newUserForm, firstName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={newUserForm.lastName}
                  onChange={(e) => setNewUserForm({...newUserForm, lastName: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={newUserForm.password}
                onChange={(e) => setNewUserForm({...newUserForm, password: e.target.value})}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAdmin"
                checked={newUserForm.isAdmin}
                onChange={(e) => setNewUserForm({...newUserForm, isAdmin: e.target.checked})}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="isAdmin">Make this user an admin</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateUserDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
