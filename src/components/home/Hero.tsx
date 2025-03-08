
import { ArrowRight, BrainCircuit, Zap, Bot, Code } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CustomButton } from '../ui/CustomButton';

const Hero = () => {
  return (
    <div className="relative bg-groop-dark bg-hero-pattern min-h-screen flex items-center overflow-hidden">
      {/* Background elements - Neural network pattern */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500/10 blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-purple-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-2/3 left-1/2 w-72 h-72 rounded-full bg-cyan-500/10 blur-[140px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Digital grid pattern */}
        <div className="absolute inset-0 opacity-10 bg-grid-pattern"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-groop-blue/10 border border-groop-blue/20 text-sm text-groop-blue mb-6">
              <Zap className="h-3.5 w-3.5" />
              <span>AI-Powered Shipping Solution</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500">Intelligent</span> Import Logistics
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-xl">
              Our AI-driven platform revolutionizes international importing with smart 
              consolidation of shipping, documentation, and payments from multiple Turkish vendors.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
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
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                <BrainCircuit className="h-5 w-5 text-cyan-400" />
                <span className="text-white/90">Smart Routing</span>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                <Bot className="h-5 w-5 text-purple-400" />
                <span className="text-white/90">24/7 AI Assistant</span>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                <Code className="h-5 w-5 text-blue-400" />
                <span className="text-white/90">API Integration</span>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                <Zap className="h-5 w-5 text-green-400" />
                <span className="text-white/90">Instant Processing</span>
              </div>
            </div>
          </div>
          
          <div className="relative flex justify-center lg:justify-end animate-slide-left">
            {/* 3D AI Visualization */}
            <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl animate-glow-pulse transition-all duration-300 hover:scale-[1.02] w-full max-w-md xl:max-w-lg">
              {/* Neural network visualization */}
              <div className="w-full h-full aspect-video bg-gradient-to-b from-groop-dark to-blue-900/20 p-4 relative">
                {/* Abstract AI visualization */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full max-w-[80%] max-h-[80%]">
                    {/* Brain network visualization */}
                    <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse"></div>
                    <div className="absolute inset-2 rounded-full bg-purple-500/20 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute inset-4 rounded-full bg-cyan-500/20 animate-pulse" style={{ animationDelay: '1s' }}></div>
                    
                    {/* Connection lines */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="0.5" fill="none" />
                      <circle cx="50" cy="50" r="30" stroke="rgba(147, 51, 234, 0.2)" strokeWidth="0.5" fill="none" />
                      <circle cx="50" cy="50" r="20" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="0.5" fill="none" />
                      
                      {/* Nodes */}
                      <circle cx="50" cy="10" r="2" fill="#3b82f6" className="animate-ping" style={{ animationDuration: '3s' }} />
                      <circle cx="80" cy="30" r="2" fill="#8b5cf6" className="animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
                      <circle cx="90" cy="60" r="2" fill="#06b6d4" className="animate-ping" style={{ animationDuration: '5s', animationDelay: '0.5s' }} />
                      <circle cx="70" cy="85" r="2" fill="#3b82f6" className="animate-ping" style={{ animationDuration: '4.5s', animationDelay: '0.7s' }} />
                      <circle cx="40" cy="90" r="2" fill="#8b5cf6" className="animate-ping" style={{ animationDuration: '3.5s', animationDelay: '1.2s' }} />
                      <circle cx="15" cy="70" r="2" fill="#06b6d4" className="animate-ping" style={{ animationDuration: '4s', animationDelay: '0.3s' }} />
                      <circle cx="10" cy="40" r="2" fill="#3b82f6" className="animate-ping" style={{ animationDuration: '5s', animationDelay: '0.8s' }} />
                      <circle cx="30" cy="15" r="2" fill="#8b5cf6" className="animate-ping" style={{ animationDuration: '3.8s', animationDelay: '1.5s' }} />
                      
                      {/* Connection lines */}
                      <line x1="50" y1="10" x2="80" y2="30" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="0.5" />
                      <line x1="80" y1="30" x2="90" y2="60" stroke="rgba(147, 51, 234, 0.3)" strokeWidth="0.5" />
                      <line x1="90" y1="60" x2="70" y2="85" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="0.5" />
                      <line x1="70" y1="85" x2="40" y2="90" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="0.5" />
                      <line x1="40" y1="90" x2="15" y2="70" stroke="rgba(147, 51, 234, 0.3)" strokeWidth="0.5" />
                      <line x1="15" y1="70" x2="10" y2="40" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="0.5" />
                      <line x1="10" y1="40" x2="30" y2="15" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="0.5" />
                      <line x1="30" y1="15" x2="50" y2="10" stroke="rgba(147, 51, 234, 0.3)" strokeWidth="0.5" />
                      
                      {/* Cross connections */}
                      <line x1="50" y1="10" x2="15" y2="70" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="0.3" />
                      <line x1="80" y1="30" x2="40" y2="90" stroke="rgba(147, 51, 234, 0.1)" strokeWidth="0.3" />
                      <line x1="90" y1="60" x2="10" y2="40" stroke="rgba(6, 182, 212, 0.1)" strokeWidth="0.3" />
                      <line x1="30" y1="15" x2="70" y2="85" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="0.3" />
                    </svg>
                    
                    {/* Center brain */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BrainCircuit className="w-16 h-16 text-blue-400/80" />
                    </div>
                  </div>
                </div>
                
                {/* UI Elements */}
                <div className="absolute top-4 left-4 glass p-2 rounded-lg border border-white/10 text-xs">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-white">AI System Online</span>
                  </div>
                </div>
                
                <div className="absolute bottom-4 left-4 right-4 glass p-3 rounded-lg border border-white/10">
                  <div className="text-xs text-white/70 mb-1">Processing Shipment Data</div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-progress"></div>
                  </div>
                </div>
                
                <div className="absolute top-4 right-4 glass p-2 rounded-lg animate-slide-down border border-white/10">
                  <div className="text-xs text-white font-medium">Route Optimization</div>
                  <div className="flex items-center mt-1">
                    <div className="w-1 h-1 rounded-full bg-blue-500 mr-1"></div>
                    <div className="w-1 h-1 rounded-full bg-purple-500 mr-1"></div>
                    <div className="w-1 h-1 rounded-full bg-cyan-500"></div>
                  </div>
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
