import { Link } from 'react-router-dom';
import { CustomButton } from '../ui/CustomButton';
import dashboardHeroImage from '@/assets/dashboard-hero.svg';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  const { user } = useAuth();
  
  return (
    <section className="bg-groop-darker min-h-screen flex flex-col justify-center relative overflow-hidden pt-20">
      {/* Background elements */}
      <div className="absolute inset-0 bg-hero-pattern bg-cover bg-center"></div>
      <div className="absolute inset-0 bg-cyber-grid bg-[length:50px_50px] opacity-20"></div>
      
      {/* Animated data stream effect */}
      <div className="absolute h-[200px] w-full top-1/3 bg-data-stream animate-data-flow opacity-30"></div>
      
      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-groop-cyan blur-xl opacity-40 animate-float"></div>
      <div className="absolute bottom-1/3 right-1/3 w-6 h-6 rounded-full bg-groop-purple blur-xl opacity-30 animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-2/3 left-1/3 w-5 h-5 rounded-full bg-groop-blue blur-xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <div className="inline-block mb-2 px-3 py-1 bg-groop-surface rounded-full backdrop-blur-sm border border-groop-blue/20">
              <span className="text-groop-neon text-sm font-medium">Shipping Simplified</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Simplify Your <span className="text-groop-cyan">Imports</span> from <span className="text-groop-purple">Türkiye</span>
            </h1>
            <p className="text-xl text-groop-accent-muted mb-8 max-w-lg">
              Consolidate your shipments, reduce costs, and streamline your supply chain with our specialized platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Link to="/dashboard">
                  <CustomButton size="lg" isGlowing className="bg-gradient-to-r from-groop-blue to-groop-cyan hover:from-groop-cyan hover:to-groop-blue text-white border-none">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </CustomButton>
                </Link>
              ) : (
                <Link to="/auth">
                  <CustomButton size="lg" isGlowing className="bg-gradient-to-r from-groop-blue to-groop-cyan hover:from-groop-cyan hover:to-groop-blue text-white border-none">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </CustomButton>
                </Link>
              )}
              <CustomButton variant="outline" size="lg" className="border-groop-blue text-groop-accent hover:bg-groop-surface-hover">
                Learn More
              </CustomButton>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-groop-blue/20 to-groop-purple/20 rounded-lg blur-xl opacity-50"></div>
            <div className="relative bg-groop-surface backdrop-blur-sm rounded-lg p-4 border border-groop-blue/20">
              <img src={dashboardHeroImage} alt="GROOP - Container Tracking Dashboard" className="w-full rounded animate-float" style={{ animationDuration: '8s' }} />
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-groop-purple/20 rounded-full blur-xl"></div>
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-groop-blue/20 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>
      
      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-groop-darkest to-transparent"></div>
    </section>
  );
};

export default Hero;
