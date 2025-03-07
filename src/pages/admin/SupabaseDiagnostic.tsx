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

const SupabaseDiagnostic = () => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [connectionTest, setConnectionTest] = useState<DiagnosticResult | null>(null);
  const [tables, setTables] = useState<DiagnosticResult | null>(null);
  const [rlsPolicies, setRlsPolicies] = useState<DiagnosticResult | null>(null);
  const [ordersCount, setOrdersCount] = useState<DiagnosticResult | null>(null);
  const [userRoles, setUserRoles] = useState<DiagnosticResult | null>(null);
  const [userInfo, setUserInfo] = useState<DiagnosticResult | null>(null);

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
      
      // Test 2: List all tables
      try {
        const { data, error } = await supabase.rpc('list_tables');
        
        if (error) throw error;
        
        setTables({
          success: true,
          message: `Found ${data?.length || 0} tables`,
          data: data,
        });
      } catch (error: any) {
        // Try alternative approach if RPC fails
        try {
          const { data, error: altError } = await supabase
            .from('pg_tables')
            .select('tablename')
            .eq('schemaname', 'public');
            
          if (altError) throw altError;
          
          setTables({
            success: true,
            message: `Found ${data?.length || 0} tables (alternative method)`,
            data: data.map(t => t.tablename),
          });
        } catch (altError: any) {
          setTables({
            success: false,
            message: `Failed to list tables: ${error.message || 'Unknown error'}. Alternative method also failed: ${altError.message || 'Unknown error'}`,
          });
        }
      }
      
      // Test 3: Check RLS policies for orders table
      try {
        const { data, error } = await supabase.rpc('list_policies_for_table', { table_name: 'orders' });
        
        if (error) throw error;
        
        setRlsPolicies({
          success: true,
          message: `Found ${data?.length || 0} RLS policies for orders table`,
          data: data,
        });
      } catch (error: any) {
        setRlsPolicies({
          success: false,
          message: `Failed to check RLS policies: ${error.message || 'Unknown error'}`,
        });
      }
      
      // Test 4: Check if there are any orders
      try {
        const { count, error } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        
        setOrdersCount({
          success: true,
          message: `Found ${count || 0} orders in the database`,
          data: { count },
        });
      } catch (error: any) {
        setOrdersCount({
          success: false,
          message: `Failed to count orders: ${error.message || 'Unknown error'}`,
        });
      }
      
      // Test 5: Check user roles
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('*');
        
        if (error) throw error;
        
        setUserRoles({
          success: true,
          message: `Found ${data?.length || 0} user role entries`,
          data: data,
        });
      } catch (error: any) {
        // Check if the table exists
        if (error.code === '42P01') { // Table doesn't exist
          setUserRoles({
            success: false,
            message: 'The user_roles table does not exist in the database',
          });
        } else {
          setUserRoles({
            success: false,
            message: `Failed to check user roles: ${error.message || 'Unknown error'}`,
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
          
          if (profileError) throw profileError;
          
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
        } catch (error: any) {
          setUserInfo({
            success: false,
            message: `Failed to get user info: ${error.message || 'Unknown error'}`,
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

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Supabase Diagnostics</h1>
          <p className="text-white/70">Check your Supabase connection and database configuration</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={runDiagnostics} 
          disabled={loading}
          className="mt-4 sm:mt-0"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Run Diagnostics
        </Button>
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
                          <TableHead>Definition</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rlsPolicies.data.map((policy: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{policy.policyname}</TableCell>
                            <TableCell className="font-mono text-xs">{policy.definition}</TableCell>
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