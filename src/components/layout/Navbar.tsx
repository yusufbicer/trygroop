
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { CustomButton } from '../ui/CustomButton';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-groop-darker/80 backdrop-blur-lg shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-groop-blue font-bold text-2xl">Groop</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-white/80 hover:text-white transition-colors">
                Home
              </Link>
              <Link to="#features" className="text-white/80 hover:text-white transition-colors">
                Features
              </Link>
              <Link to="#how-it-works" className="text-white/80 hover:text-white transition-colors">
                How It Works
              </Link>
              <Link to="#blog" className="text-white/80 hover:text-white transition-colors">
                Blog
              </Link>
              <Link to="/dashboard">
                <CustomButton variant="secondary" size="sm">
                  Sign In
                </CustomButton>
              </Link>
              <Link to="/dashboard">
                <CustomButton variant="primary" size="sm" isGlowing>
                  Get Started
                </CustomButton>
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-groop-blue focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-groop-dark glass animate-fade-in">
          <div className="px-4 pt-2 pb-4 space-y-3">
            <Link
              to="/"
              className="block py-2 text-white hover:text-groop-blue"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="#features"
              className="block py-2 text-white hover:text-groop-blue"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              to="#how-it-works"
              className="block py-2 text-white hover:text-groop-blue"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              to="#blog"
              className="block py-2 text-white hover:text-groop-blue"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <div className="flex flex-col gap-3 pt-2">
              <Link to="/dashboard">
                <CustomButton
                  variant="secondary"
                  className="w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </CustomButton>
              </Link>
              <Link to="/dashboard">
                <CustomButton
                  variant="primary"
                  className="w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </CustomButton>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
