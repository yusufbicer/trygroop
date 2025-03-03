
import { Link } from 'react-router-dom';
import { CustomButton } from '../ui/CustomButton';

const CTASection = () => {
  return (
    <section className="py-20 bg-groop-dark relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full bg-groop-blue/10 blur-[100px]"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-groop-blue/5 blur-[120px]"></div>
      </div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="glass border border-white/10 rounded-2xl p-8 md:p-12 text-center">
          <div className="inline-block px-3 py-1 rounded-full bg-groop-blue/10 border border-groop-blue/20 text-sm text-groop-blue mb-6 animate-fade-in">
            Ready to Get Started?
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 animate-slide-up">
            Simplify Your Import Process Today
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Join thousands of businesses that have streamlined their imports from Turkey with Groop's all-in-one platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/dashboard">
              <CustomButton size="lg" isGlowing>
                Start Your Free Trial
              </CustomButton>
            </Link>
            <Link to="#features">
              <CustomButton variant="outline" size="lg">
                Learn More
              </CustomButton>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
