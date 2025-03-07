
import { Link } from 'react-router-dom';
import { CustomButton } from '../ui/CustomButton';
import mockupImage from '@/assets/mockup.svg';
import { useAuth } from '@/context/AuthContext';

const Hero = () => {
  const { user } = useAuth();
  
  return (
    <section className="bg-groop-darker min-h-screen flex flex-col justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/mesh-bg.svg')] bg-cover bg-center opacity-20"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Simplify Your <span className="text-groop-blue">Imports</span> from Turkey
            </h1>
            <p className="text-xl text-white/70 mb-8 max-w-lg">
              Consolidate your shipments, reduce costs, and streamline your supply chain with our specialized platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Link to="/dashboard">
                  <CustomButton size="lg" isGlowing>
                    Go to Dashboard
                  </CustomButton>
                </Link>
              ) : (
                <Link to="/auth">
                  <CustomButton size="lg" isGlowing>
                    Get Started
                  </CustomButton>
                </Link>
              )}
              <CustomButton variant="outline" size="lg">
                Learn More
              </CustomButton>
            </div>
          </div>
          <div className="md:w-1/2">
            <img src={mockupImage} alt="Platform preview" className="w-full" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-groop-dark to-transparent"></div>
    </section>
  );
};

export default Hero;
