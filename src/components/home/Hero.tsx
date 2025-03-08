
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CustomButton } from '../ui/CustomButton';
import mockupSvg from '../../assets/mockup.svg';

const Hero = () => {
  return (
    <div className="relative bg-groop-dark bg-hero-pattern min-h-screen flex items-center overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-groop-blue/10 blur-[100px]"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-groop-blue/5 blur-[120px]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <div className="inline-block px-3 py-1 rounded-full bg-groop-blue/10 border border-groop-blue/20 text-sm text-groop-blue mb-6">
              AI-Powered Shipping Solution
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white text-glow leading-tight tracking-tight">
              Simplify Your Imports with Groop
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-xl">
              One-stop platform for international importers to consolidate shipping, documentation, and payments from multiple Turkish vendors.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link to="/dashboard">
                <CustomButton size="lg" isGlowing className="font-medium w-full sm:w-auto">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </CustomButton>
              </Link>
              <Link to="#how-it-works">
                <CustomButton variant="secondary" size="lg" className="font-medium w-full sm:w-auto">
                  Watch Demo
                </CustomButton>
              </Link>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-groop-blue mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white/80">Secure Payments</span>
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-groop-blue mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white/80">24/7 Support</span>
              </div>
            </div>
          </div>
          
          <div className="relative flex justify-center lg:justify-end animate-slide-left">
            <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl animate-glow-pulse transition-all duration-300 hover:scale-[1.02]">
              <img
                src={mockupSvg}
                alt="Groop Dashboard"
                className="w-full h-auto max-w-md xl:max-w-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-groop-dark/80 to-transparent opacity-50"></div>
              
              {/* Floating notification */}
              <div className="absolute top-8 right-8 glass p-3 rounded-lg animate-slide-down shadow-lg border border-white/10 text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-white">New shipment arrived</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
