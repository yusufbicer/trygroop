import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabase';

interface SignUpButtonProps {
  email: string;
  password: string;
  disabled?: boolean;
}

export const SignUpButton = ({ email, password, disabled }: SignUpButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSignUp = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      toast({
        title: "Success!",
        description: "Check your email for the confirmation link",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleSignUp}
      variant="outline"
      className="w-full"
      disabled={disabled || loading}
    >
      Sign up
    </Button>
  );
};