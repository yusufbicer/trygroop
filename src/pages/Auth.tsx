import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Auth = () => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; auth?: string }>({});
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      if (authMode === 'signup') {
        await signUp(email, password, { first_name: firstName, last_name: lastName });
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      // Position errors in a more visible way
      console.error('Auth error:', error);
      setErrors({
        auth: error.message || 'Authentication failed. Please check your credentials.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-groop-darker py-12">
      <Card className="w-full max-w-md glass">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-white font-semibold">{authMode === 'signin' ? 'Sign In' : 'Sign Up'}</CardTitle>
          <CardDescription className="text-white/70">Enter your credentials to {authMode === 'signin' ? 'access your account' : 'create an account'}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {errors.auth && (
            <div className="p-3 mb-4 rounded-md bg-red-500/20 border border-red-500 text-white">
              <p className="text-sm font-medium">{errors.auth}</p>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              {authMode === 'signup' && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="firstName" className="text-right">
                      First Name
                    </Label>
                    <Input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="lastName" className="text-right">
                      Last Name
                    </Label>
                    <Input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <Button disabled={isSubmitting} type="submit" className="col-span-4">
                {isSubmitting ? 'Submitting...' : authMode === 'signin' ? 'Sign In' : 'Sign Up'}
              </Button>
            </div>
          </form>
          <div className="text-center text-sm text-white/70">
            {authMode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <Link to="/auth/signup" className="text-groop-blue hover:underline" onClick={() => setAuthMode('signup')}>
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link to="/auth/signin" className="text-groop-blue hover:underline" onClick={() => setAuthMode('signin')}>
                  Sign In
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
