const Navbar = () => {
  return (
    <nav className="fixed w-full z-50 bg-surface/80 backdrop-blur-sm border-b border-accent/20">
      <div className="max-w-[1200px] mx-auto flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-semibold text-primary text-lg">GROOP</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#enterprise" className="text-secondary hover:text-primary transition-colors">Enterprise</a>
          <a href="#pricing" className="text-secondary hover:text-primary transition-colors">Pricing</a>
          <a href="#docs" className="text-secondary hover:text-primary transition-colors">Docs</a>
          <a href="#faq" className="text-secondary hover:text-primary transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-secondary hover:text-primary transition-colors font-medium">
            Sign in
          </button>
          <button className="bg-primary text-surface px-4 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium hidden md:block">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;