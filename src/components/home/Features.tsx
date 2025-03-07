import { Package, FileText, CreditCard, TrendingUp, Globe, Shield } from 'lucide-react';
import { CustomCard, CustomCardHeader, CustomCardContent } from '../ui/CustomCard';

const features = [
  {
    icon: Package,
    title: 'Shipping Consolidation',
    description: 'Combine shipments from multiple vendors into a single container, reducing costs and simplifying logistics.',
  },
  {
    icon: FileText,
    title: 'Document Centralization',
    description: 'Store all shipping documents in one secure location for easy access and management.',
  },
  {
    icon: CreditCard,
    title: 'Payment Consolidation',
    description: 'Make a single payment for all your shipments, eliminating the need for multiple transactions.',
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Tracking',
    description: 'Monitor your shipments in real-time with detailed updates and notifications.',
  },
  {
    icon: Globe,
    title: 'Multi-Vendor Management',
    description: 'Manage relationships with multiple Turkish vendors through a single interface.',
  },
  {
    icon: Shield,
    title: 'Secure Data Protection',
    description: 'Your shipping and payment data is protected with advanced encryption and security measures.',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-groop-darker relative">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-groop-dark to-transparent"></div>
      <div className="absolute inset-0 bg-cyber-grid bg-[length:50px_50px] opacity-10"></div>
      
      {/* Decorative elements */}
      <div className="absolute right-0 top-1/4 w-64 h-64 bg-groop-blue/5 rounded-full blur-3xl"></div>
      <div className="absolute left-0 bottom-1/4 w-80 h-80 bg-groop-purple/5 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-groop-surface backdrop-blur-sm border border-groop-blue/20 text-sm text-groop-cyan mb-6">
            Core Features
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-groop-accent mb-4">
            Everything You Need in <span className="text-groop-cyan">One Place</span>
          </h2>
          <p className="text-groop-accent-muted max-w-2xl mx-auto">
            Our platform combines all essential import services into a single, easy-to-use interface, saving you time and money.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CustomCard interactive glassEffect className="border border-groop-blue/10 bg-groop-surface backdrop-blur-sm hover:border-groop-blue/30 transition-all duration-300">
                <CustomCardHeader>
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-groop-blue/20 to-groop-purple/20 backdrop-blur-sm mb-4 border border-groop-blue/20">
                    <feature.icon className="h-6 w-6 text-groop-cyan" />
                  </div>
                  <h3 className="text-xl font-semibold text-groop-accent mb-2">{feature.title}</h3>
                </CustomCardHeader>
                <CustomCardContent>
                  <p className="text-groop-accent-muted">{feature.description}</p>
                </CustomCardContent>
                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-groop-blue/30 to-transparent"></div>
              </CustomCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
