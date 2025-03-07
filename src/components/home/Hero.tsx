import { Link } from 'react-router-dom';
import { CustomButton } from '../ui/CustomButton';
import dashboardHeroImage from '@/assets/dashboard-hero.svg';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, Zap, Globe, Package, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

const Hero = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [animateCounter, setAnimateCounter] = useState(false);
  const [counter, setCounter] = useState(0);
  
  useEffect(() => {
    // Trigger entrance animations after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    // Start counter animation after 1 second
    const counterTimer = setTimeout(() => {
      setAnimateCounter(true);
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(counterTimer);
    };
  }, []);
  
  // Counter animation effect
  useEffect(() => {
    if (animateCounter) {
      if (counter < 78) {
        const timer = setTimeout(() => {
          setCounter(prev => prev + 1);
        }, 20);
        return () => clearTimeout(timer);
      }
    }
  }, [counter, animateCounter]);
  
  return (
    <section className="bg-groop-darker min-h-screen flex flex-col justify-center relative overflow-hidden pt-20">
      {/* Advanced background elements */}
      <div className="absolute inset-0 bg-hero-pattern bg-cover bg-center"></div>
      <div className="absolute inset-0 bg-cyber-grid bg-[length:30px_30px] opacity-10"></div>
      
      {/* Animated data streams */}
      <div className="absolute h-[1px] w-full top-1/4 bg-groop-cyan/30 animate-data-flow opacity-70"></div>
      <div className="absolute h-[1px] w-full top-1/3 bg-groop-purple/30 animate-data-flow opacity-70" style={{ animationDuration: '12s', animationDelay: '1s' }}></div>
      <div className="absolute h-[1px] w-full top-2/3 bg-groop-blue/30 animate-data-flow opacity-70" style={{ animationDuration: '15s', animationDelay: '0.5s' }}></div>
      
      {/* Digital particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 rounded-full bg-groop-neon"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.2,
              animation: `float ${Math.random() * 10 + 5}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`
            }}
          ></div>
        ))}
      </div>
      
      {/* Larger glowing orbs */}
      <div className="absolute top-1/4 left-1/5 w-32 h-32 rounded-full bg-groop-cyan/5 blur-[80px] animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-groop-purple/5 blur-[100px] animate-pulse" style={{ animationDuration: '7s', animationDelay: '1s' }}></div>
      <div className="absolute top-2/3 left-1/3 w-40 h-40 rounded-full bg-groop-blue/5 blur-[90px] animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
        {/* Futuristic stats bar */}
        <div className={`flex justify-center mb-12 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-groop-surface/40 backdrop-blur-md rounded-2xl border border-groop-blue/20 p-1 flex flex-wrap justify-center">
            <div className="px-6 py-3 flex items-center border-r border-groop-blue/10 last:border-0">
              <Zap className="h-5 w-5 text-groop-cyan mr-2" />
              <div>
                <div className="text-groop-accent-muted text-xs">Efficiency</div>
                <div className="text-groop-accent font-bold">+45%</div>
              </div>
            </div>
            <div className="px-6 py-3 flex items-center border-r border-groop-blue/10 last:border-0">
              <Globe className="h-5 w-5 text-groop-purple mr-2" />
              <div>
                <div className="text-groop-accent-muted text-xs">Global Reach</div>
                <div className="text-groop-accent font-bold">15+ Countries</div>
              </div>
            </div>
            <div className="px-6 py-3 flex items-center border-r border-groop-blue/10 last:border-0">
              <Package className="h-5 w-5 text-groop-blue mr-2" />
              <div>
                <div className="text-groop-accent-muted text-xs">Shipments</div>
                <div className="text-groop-accent font-bold">10K+</div>
              </div>
            </div>
            <div className="px-6 py-3 flex items-center">
              <TrendingUp className="h-5 w-5 text-groop-neon mr-2" />
              <div>
                <div className="text-groop-accent-muted text-xs">Cost Savings</div>
                <div className="text-groop-accent font-bold">30%</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center">
          <div className={`md:w-1/2 mb-12 md:mb-0 transition-all duration-1000 delay-300 transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="inline-block mb-2 px-3 py-1 bg-groop-surface/60 rounded-full backdrop-blur-md border border-groop-blue/20">
              <span className="text-groop-neon text-sm font-medium flex items-center">
                <Zap className="h-4 w-4 mr-1 animate-pulse" />
                Next-Gen Shipping Platform
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
              <span className="block">Revolutionize Your</span>
              <span className="bg-gradient-to-r from-groop-blue via-groop-cyan to-groop-purple bg-clip-text text-transparent">
                Türkiye Imports
              </span>
            </h1>
            <p className="text-xl text-groop-accent-muted mb-8 max-w-lg">
              Our AI-powered platform consolidates shipments, optimizes routes, and streamlines documentation—all in one futuristic interface.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Link to="/dashboard">
                  <CustomButton 
                    size="lg" 
                    isGlowing 
                    className="bg-gradient-to-r from-groop-blue to-groop-cyan hover:from-groop-cyan hover:to-groop-blue text-white border-none px-8 py-6 rounded-xl shadow-lg shadow-groop-blue/20"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </CustomButton>
                </Link>
              ) : (
                <Link to="/auth">
                  <CustomButton 
                    size="lg" 
                    isGlowing 
                    className="bg-gradient-to-r from-groop-blue to-groop-cyan hover:from-groop-cyan hover:to-groop-blue text-white border-none px-8 py-6 rounded-xl shadow-lg shadow-groop-blue/20"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </CustomButton>
                </Link>
              )}
              <CustomButton 
                variant="outline" 
                size="lg" 
                className="border-groop-blue/50 text-groop-accent hover:bg-groop-surface-hover px-8 py-6 rounded-xl backdrop-blur-sm"
              >
                Watch Demo
              </CustomButton>
            </div>
          </div>
          
          <div className={`md:w-1/2 relative transition-all duration-1000 delay-500 transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            {/* Futuristic frame with animated elements */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-groop-blue/30 via-groop-cyan/20 to-groop-purple/30 rounded-2xl blur-xl opacity-70 animate-pulse" style={{ animationDuration: '4s' }}></div>
            
            {/* Animated corner accents */}
            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-groop-cyan rounded-tl-lg"></div>
            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-groop-purple rounded-tr-lg"></div>
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-groop-purple rounded-bl-lg"></div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-groop-cyan rounded-br-lg"></div>
            
            <div className="relative bg-groop-surface/80 backdrop-blur-md rounded-xl p-5 border border-groop-blue/20">
              {/* Loading percentage indicator */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-groop-surface/90 backdrop-blur-md px-4 py-1 rounded-full border border-groop-blue/30 flex items-center">
                <div className="w-2 h-2 rounded-full bg-groop-cyan animate-pulse mr-2"></div>
                <span className="text-groop-cyan font-mono">{counter}% Optimized</span>
              </div>
              
              <img 
                src={dashboardHeroImage} 
                alt="GROOP - Container Tracking Dashboard" 
                className="w-full rounded-lg shadow-2xl shadow-groop-blue/10 animate-float" 
                style={{ animationDuration: '8s' }} 
              />
              
              {/* Interactive data points */}
              <div className="absolute top-1/4 left-1/4 w-6 h-6 rounded-full bg-groop-surface/80 border border-groop-cyan flex items-center justify-center group cursor-pointer">
                <div className="absolute w-2 h-2 bg-groop-cyan rounded-full animate-ping"></div>
                <div className="absolute w-3 h-3 bg-groop-cyan/50 rounded-full"></div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-groop-surface/90 backdrop-blur-md px-2 py-1 rounded text-xs text-groop-accent border border-groop-blue/20 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Container Status: Loading
                </div>
              </div>
              
              <div className="absolute top-1/2 right-1/3 w-6 h-6 rounded-full bg-groop-surface/80 border border-groop-purple flex items-center justify-center group cursor-pointer">
                <div className="absolute w-2 h-2 bg-groop-purple rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                <div className="absolute w-3 h-3 bg-groop-purple/50 rounded-full"></div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-groop-surface/90 backdrop-blur-md px-2 py-1 rounded text-xs text-groop-accent border border-groop-blue/20 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Departure: Istanbul Port
                </div>
              </div>
              
              <div className="absolute bottom-1/4 right-1/4 w-6 h-6 rounded-full bg-groop-surface/80 border border-groop-blue flex items-center justify-center group cursor-pointer">
                <div className="absolute w-2 h-2 bg-groop-blue rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
                <div className="absolute w-3 h-3 bg-groop-blue/50 rounded-full"></div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-groop-surface/90 backdrop-blur-md px-2 py-1 rounded text-xs text-groop-accent border border-groop-blue/20 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Arrival: Matadi Port, DRC
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-groop-purple/10 rounded-full blur-xl"></div>
            <div className="absolute -top-6 -left-6 w-40 h-40 bg-groop-blue/10 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>
      
      {/* Animated bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-groop-darkest to-transparent"></div>
      
      {/* Scrolling indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
        <div className="w-8 h-12 rounded-full border-2 border-groop-blue/30 flex justify-center">
          <div className="w-1 h-3 bg-groop-cyan rounded-full mt-2 animate-float" style={{ animationDuration: '1.5s' }}></div>
        </div>
        <span className="text-groop-accent-muted text-xs mt-2">Scroll Down</span>
      </div>
    </section>
  );
};

export default Hero;
