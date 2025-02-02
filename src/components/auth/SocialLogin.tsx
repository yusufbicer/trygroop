import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabase';
import { FaGoogle, FaFacebook, FaXTwitter } from 'react-icons/fa6';
import { Provider } from '@supabase/supabase-js';

export const SocialLogin = () => {
  const { toast } = useToast();

  const handleSocialLogin = async (provider: Provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <Button
        type="button"
        variant="outline"
        onClick={() => handleSocialLogin('google')}
        className="w-full"
      >
        <FaGoogle className="mr-2" />
        Google
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => handleSocialLogin('facebook')}
        className="w-full"
      >
        <FaFacebook className="mr-2" />
        Facebook
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => handleSocialLogin('twitter')}
        className="w-full"
      >
        <FaXTwitter className="mr-2" />
        X
      </Button>
    </div>
  );
};