
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, MessageCircle } from 'lucide-react';
import { CustomButton } from '../ui/CustomButton';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

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

  const handleChatClick = () => {
    // This will be replaced with WhatsApp functionality later
    alert('Chat functionality will be implemented later');
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    setIsMobileMenuOpen(false);
    
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
              <button 
                onClick={() => scrollToSection('features')} 
                className="text-white/80 hover:text-white transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')} 
                className="text-white/80 hover:text-white transition-colors"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection('blog')} 
                className="text-white/80 hover:text-white transition-colors"
              >
                Blog
              </button>
              <button
                onClick={handleChatClick}
                className="text-white/80 hover:text-white transition-colors flex items-center"
              >
                <MessageCircle className="h-5 w-5 mr-1" />
                Chat with us
              </button>
              {user ? (
                <>
                  <Link to="/dashboard">
                    <CustomButton variant="secondary" size="sm">
                      Dashboard
                    </CustomButton>
                  </Link>
                  <CustomButton variant="outline" size="sm" onClick={() => signOut()}>
                    Sign Out
                  </CustomButton>
                </>
              ) : (
                <Link to="/auth">
                  <CustomButton variant="primary" size="sm" isGlowing>
                    Get Started
                  </CustomButton>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3">
            <button
              onClick={handleChatClick}
              className="text-white hover:text-groop-blue focus:outline-none"
            >
              <MessageCircle className="h-5 w-5" />
            </button>
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
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left py-2 text-white hover:text-groop-blue"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="block w-full text-left py-2 text-white hover:text-groop-blue"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('blog')}
              className="block w-full text-left py-2 text-white hover:text-groop-blue"
            >
              Blog
            </button>
            <div className="flex flex-col gap-3 pt-2">
              {user ? (
                <>
                  <Link to="/dashboard">
                    <CustomButton
                      variant="secondary"
                      className="w-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </CustomButton>
                  </Link>
                  <CustomButton
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign Out
                  </CustomButton>
                </>
              ) : (
                <Link to="/auth">
                  <CustomButton
                    variant="primary"
                    className="w-full"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </CustomButton>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
