
import { Link } from 'react-router-dom';
import { CustomButton } from '../ui/CustomButton';
import { useAuth } from '@/context/AuthContext';

const CTASection = () => {
  const { user } = useAuth();
  
  return (
    <section className="py-20 bg-groop-dark relative z-10">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-groop-blue/5 blur-[100px]"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full bg-groop-blue/5 blur-[120px]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="glass border border-white/10 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Simplify Your Turkish Imports?
          </h2>
          <p className="text-white/70 text-lg max-w-3xl mx-auto mb-8">
            Join Groop today and experience a streamlined approach to consolidating and managing your imports from Turkey.
          </p>
          {user ? (
            <Link to="/dashboard">
              <CustomButton size="lg" isGlowing>
                Go to Dashboard
              </CustomButton>
            </Link>
          ) : (
            <Link to="/auth?tab=signup">
              <CustomButton size="lg" isGlowing>
                Start Your Free Trial
              </CustomButton>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default CTASection;
