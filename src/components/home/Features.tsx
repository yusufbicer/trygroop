
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
    <section id="features" className="py-20 bg-groop-darker relative z-0">
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-groop-dark to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-groop-blue/10 border border-groop-blue/20 text-sm text-groop-blue mb-6">
            Core Features
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything You Need in One Place
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Our platform combines all essential import services into a single, easy-to-use interface, saving you time and money.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CustomCard interactive glassEffect>
                <CustomCardHeader>
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-groop-blue/10 mb-4">
                    <feature.icon className="h-6 w-6 text-groop-blue" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                </CustomCardHeader>
                <CustomCardContent>
                  <p className="text-white/70">{feature.description}</p>
                </CustomCardContent>
              </CustomCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
