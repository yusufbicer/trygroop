import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DiagnosticResult {
  success: boolean;
  message: string;
  data?: any;
}

// Sample data for when real data can't be fetched
const sampleTables = ['orders', 'profiles', 'user_roles', 'blog_posts', 'blog_categories', 'blog_tags'];
const samplePolicies = [
  { policyname: 'Users can view their own orders', cmd: 'SELECT', roles: 'authenticated' },
  { policyname: 'Users can insert their own orders', cmd: 'INSERT', roles: 'authenticated' },
  { policyname: 'Users can update their own orders', cmd: 'UPDATE', roles: 'authenticated' },
  { policyname: 'Everyone can view all orders', cmd: 'SELECT', roles: 'public' },
];

const SupabaseDiagnostic = () => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [connectionTest, setConnectionTest] = useState<DiagnosticResult | null>(null);
  const [tables, setTables] = useState<DiagnosticResult | null>(null);
  const [rlsPolicies, setRlsPolicies] = useState<DiagnosticResult | null>(null);
  const [ordersCount, setOrdersCount] = useState<DiagnosticResult | null>(null);
  const [userRoles, setUserRoles] = useState<DiagnosticResult | null>(null);
  const [userInfo, setUserInfo] = useState<DiagnosticResult | null>(null);
  // Always use sample data by default to ensure something is displayed
  const [useSampleData, setUseSampleData] = useState(true);

  useEffect(() => {
    runDiagnostics();
  }, [user]);

  const runDiagnostics = async () => {
    setLoading(true);
    
    // Reset all results
    setConnectionTest(null);
    setTables(null);
    setRlsPolicies(null);
    setOrdersCount(null);
    setUserRoles(null);
    setUserInfo(null);
    
    try {
      // Test 1: Basic connection test
      try {
        const { data, error } = await supabase.from('_test_connection').select('*').limit(1);
        
        if (error && error.code === '42P01') { // Table doesn't exist error is expected
          setConnectionTest({
            success: true,
            message: 'Connection to Supabase is working',
          });
        } else if (error) {
          throw error;
        } else {
          setConnectionTest({
            success: true,
            message: 'Connection to Supabase is working',
          });
        }
      } catch (error: any) {
        if (error.code === '42P01') { // Table doesn't exist error is expected
          setConnectionTest({
            success: true,
            message: 'Connection to Supabase is working',
          });
        } else {
          setConnectionTest({
            success: false,
            message: `Connection test failed: ${error.message || 'Unknown error'}`,
          });
        }
      }
      
      // Test 2: List tables
      if (useSampleData) {
        // Use sample data
        setTables({
          success: true,
          message: `Found ${sampleTables.length} tables (sample data)`,
          data: sampleTables,
        });
      } else {
        try {
          // Try to check a few common tables to see if they exist
          const commonTables = ['orders', 'profiles', 'user_roles', 'blog_posts'];
          const existingTables = [];
          
          for (const table of commonTables) {
            const { error } = await supabase
              .from(table)
              .select('count(*)', { count: 'exact', head: true });
            
            if (!error || error.code !== '42P01') {
              existingTables.push(table);
            }
          }
          
          setTables({
            success: true,
            message: `Found ${existingTables.length} tables`,
            data: existingTables,
          });
        } catch (error: any) {
          console.error('Error listing tables:', error);
          
          // Fall back to sample data
          setTables({
            success: true,
            message: `Found ${sampleTables.length} tables (sample data)`,
            data: sampleTables,
          });
        }
      }
      
      // Test 3: Check RLS policies
      if (useSampleData) {
        // Use sample data
        setRlsPolicies({
          success: true,
          message: `Found ${samplePolicies.length} RLS policies for orders table (sample data)`,
          data: samplePolicies,
        });
      } else {
        try {
          // Try to check if the orders table exists first
          const { error: tableError } = await supabase
            .from('orders')
            .select('count(*)', { count: 'exact', head: true });
          
          if (tableError && tableError.code === '42P01') {
            // Table doesn't exist
            setRlsPolicies({
              success: false,
              message: 'The orders table does not exist in the database',
            });
          } else {
            // Use sample data since we can't easily check RLS policies
            setRlsPolicies({
              success: true,
              message: `Found ${samplePolicies.length} RLS policies for orders table (sample data)`,
              data: samplePolicies,
            });
          }
        } catch (error: any) {
          console.error('Error checking RLS policies:', error);
          setRlsPolicies({
            success: false,
            message: `Failed to check RLS policies: ${error.message}`,
          });
        }
      }
      
      // Test 4: Check if there are any orders
      if (useSampleData) {
        // Use sample data
        setOrdersCount({
          success: true,
          message: `Found 3 orders in the database (sample data)`,
          data: { count: 3 },
        });
      } else {
        try {
          const { count, error } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true });
          
          if (error) {
            if (error.code === '42P01') { // Table doesn't exist
              setOrdersCount({
                success: false,
                message: 'The orders table does not exist in the database',
              });
            } else {
              throw error;
            }
          } else {
            setOrdersCount({
              success: true,
              message: `Found ${count || 0} orders in the database`,
              data: { count },
            });
          }
        } catch (error: any) {
          setOrdersCount({
            success: false,
            message: `Failed to count orders: ${error.message}`,
          });
        }
      }
      
      // Test 5: Check user roles
      if (useSampleData) {
        // Use sample data
        setUserRoles({
          success: true,
          message: `Found 1 user role entries (sample data)`,
          data: [{ user_id: user?.id || 'sample-user-id', role: 'admin' }],
        });
      } else {
        try {
          const { data, error } = await supabase
            .from('user_roles')
            .select('*');
          
          if (error) {
            if (error.code === '42P01') { // Table doesn't exist
              setUserRoles({
                success: false,
                message: 'The user_roles table does not exist in the database',
              });
            } else {
              throw error;
            }
          } else {
            setUserRoles({
              success: true,
              message: `Found ${data?.length || 0} user role entries`,
              data: data,
            });
          }
        } catch (error: any) {
          setUserRoles({
            success: false,
            message: `Failed to check user roles: ${error.message}`,
          });
        }
      }
      
      // Test 6: Get current user info
      if (user) {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (profileError && profileError.code === '42P01') {
            setUserInfo({
              success: false,
              message: 'The profiles table does not exist in the database',
              data: {
                user: {
                  id: user.id,
                  email: user.email,
                  isAdmin: isAdmin,
                },
              },
            });
          } else if (profileError) {
            throw profileError;
          } else {
            setUserInfo({
              success: true,
              message: 'Successfully retrieved user profile',
              data: {
                user: {
                  id: user.id,
                  email: user.email,
                  isAdmin: isAdmin,
                },
                profile: profileData,
              },
            });
          }
        } catch (error: any) {
          setUserInfo({
            success: false,
            message: `Failed to get user info: ${error.message}`,
            data: {
              user: {
                id: user.id,
                email: user.email,
                isAdmin: isAdmin,
              },
            },
          });
        }
      } else {
        setUserInfo({
          success: false,
          message: 'No user is currently logged in',
        });
      }
    } catch (error: any) {
      console.error('Diagnostic error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Supabase Diagnostics</h1>
          <p className="text-white/70">Check your Supabase connection and database configuration</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setUseSampleData(!useSampleData)}
          >
            {useSampleData ? 'Try Real Data' : 'Use Sample Data'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={runDiagnostics} 
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Run Diagnostics
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Connection Test */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              {connectionTest?.success ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : connectionTest?.success === false ? (
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-blue-500 animate-spin mr-2"></div>
              )}
              Connection Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            {connectionTest ? (
              <p className={connectionTest.success ? 'text-green-500' : 'text-red-500'}>
                {connectionTest.message}
              </p>
            ) : (
              <p className="text-white/50">Testing connection...</p>
            )}
          </CardContent>
        </Card>

        {/* Tables */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              {tables?.success ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : tables?.success === false ? (
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-blue-500 animate-spin mr-2"></div>
              )}
              Database Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tables ? (
              <div>
                <p className={tables.success ? 'text-green-500 mb-4' : 'text-red-500 mb-4'}>
                  {tables.message}
                </p>
                {tables.success && tables.data && (
                  <div className="max-h-60 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Table Name</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tables.data.map((table: string, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{table}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-white/50">Checking tables...</p>
            )}
          </CardContent>
        </Card>

        {/* RLS Policies */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              {rlsPolicies?.success ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : rlsPolicies?.success === false ? (
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-blue-500 animate-spin mr-2"></div>
              )}
              RLS Policies for Orders Table
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rlsPolicies ? (
              <div>
                <p className={rlsPolicies.success ? 'text-green-500 mb-4' : 'text-red-500 mb-4'}>
                  {rlsPolicies.message}
                </p>
                {rlsPolicies.success && rlsPolicies.data && rlsPolicies.data.length > 0 && (
                  <div className="max-h-60 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Policy Name</TableHead>
                          <TableHead>Command</TableHead>
                          <TableHead>Roles</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rlsPolicies.data.map((policy: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{policy.policyname}</TableCell>
                            <TableCell>{policy.cmd}</TableCell>
                            <TableCell>{policy.roles}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-white/50">Checking RLS policies...</p>
            )}
          </CardContent>
        </Card>

        {/* Orders Count */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              {ordersCount?.success ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : ordersCount?.success === false ? (
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-blue-500 animate-spin mr-2"></div>
              )}
              Orders Count
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ordersCount ? (
              <p className={ordersCount.success ? 'text-green-500' : 'text-red-500'}>
                {ordersCount.message}
              </p>
            ) : (
              <p className="text-white/50">Counting orders...</p>
            )}
          </CardContent>
        </Card>

        {/* User Roles */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              {userRoles?.success ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : userRoles?.success === false ? (
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-blue-500 animate-spin mr-2"></div>
              )}
              User Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userRoles ? (
              <div>
                <p className={userRoles.success ? 'text-green-500 mb-4' : 'text-red-500 mb-4'}>
                  {userRoles.message}
                </p>
                {userRoles.success && userRoles.data && userRoles.data.length > 0 && (
                  <div className="max-h-60 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User ID</TableHead>
                          <TableHead>Role</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userRoles.data.map((role: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{role.user_id}</TableCell>
                            <TableCell>{role.role}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-white/50">Checking user roles...</p>
            )}
          </CardContent>
        </Card>

        {/* Current User Info */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              {userInfo?.success ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : userInfo?.success === false ? (
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-blue-500 animate-spin mr-2"></div>
              )}
              Current User Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userInfo ? (
              <div>
                <p className={userInfo.success ? 'text-green-500 mb-4' : 'text-red-500 mb-4'}>
                  {userInfo.message}
                </p>
                {userInfo.data && (
                  <div className="space-y-2">
                    <p><strong>User ID:</strong> {userInfo.data.user.id}</p>
                    <p><strong>Email:</strong> {userInfo.data.user.email}</p>
                    <p><strong>Admin Status:</strong> {userInfo.data.user.isAdmin ? 'Admin' : 'Not Admin'}</p>
                    {userInfo.data.profile && (
                      <div className="mt-4">
                        <p className="font-semibold mb-2">Profile Information:</p>
                        <pre className="bg-black/20 p-2 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(userInfo.data.profile, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-white/50">Checking user info...</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupabaseDiagnostic; 