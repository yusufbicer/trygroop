import { Link } from 'react-router-dom';
import { CustomButton } from '../ui/CustomButton';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight } from 'lucide-react';

const CTASection = () => {
  const { user } = useAuth();
  
  return (
    <section className="py-20 bg-groop-dark relative">
      {/* Background elements */}
      <div className="absolute inset-0 bg-cyber-grid bg-[length:50px_50px] opacity-10"></div>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-groop-cyan/5 blur-[100px]"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full bg-groop-purple/5 blur-[120px]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-groop-surface backdrop-blur-sm border border-groop-blue/20 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-groop-blue/10 blur-xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-groop-purple/10 blur-xl"></div>
          
          {/* Animated data stream */}
          <div className="absolute h-[100px] w-full top-1/2 -translate-y-1/2 bg-data-stream animate-data-flow opacity-20"></div>
          
          {/* Content */}
          <div className="relative z-10">
            <div className="inline-block px-3 py-1 rounded-full bg-groop-surface backdrop-blur-sm border border-groop-blue/20 text-sm text-groop-cyan mb-6">
              Get Started Today
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-groop-accent mb-6">
              Ready to Simplify Your <span className="text-groop-cyan">Turkish</span> Imports?
            </h2>
            <p className="text-groop-accent-muted text-lg max-w-3xl mx-auto mb-8">
              Join Groop today and experience a streamlined approach to consolidating and managing your imports from Türkiye.
            </p>
            {user ? (
              <Link to="/dashboard">
                <CustomButton 
                  size="lg" 
                  isGlowing 
                  className="bg-gradient-to-r from-groop-blue to-groop-cyan hover:from-groop-cyan hover:to-groop-blue text-white px-8 py-6 rounded-xl shadow-lg shadow-groop-blue/20"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </CustomButton>
              </Link>
            ) : (
              <Link to="/auth?tab=signup">
                <CustomButton 
                  size="lg" 
                  isGlowing 
                  className="bg-gradient-to-r from-groop-blue to-groop-cyan hover:from-groop-cyan hover:to-groop-blue text-white px-8 py-6 rounded-xl shadow-lg shadow-groop-blue/20"
                >
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </CustomButton>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
