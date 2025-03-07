import { useState } from 'react';
import { CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { CustomButton } from '../ui/CustomButton';

const steps = [
  {
    number: '01',
    title: 'Register Your Account',
    description: 'Create your Groop account in minutes. Provide your business information and verify your identity.',
    details: 'Our streamlined registration process is designed to get you up and running quickly. We only collect essential information and verify your identity to ensure the security of our platform. After registration, you\'ll have immediate access to your dashboard.',
  },
  {
    number: '02',
    title: 'Add Your Suppliers',
    description: 'Input your Turkish suppliers into the system. You can add as many suppliers as you need.',
    details: 'You can easily add all your Turkish suppliers to our platform. For each supplier, you can store contact information, product categories, and specific shipping preferences. This makes future order processing much faster.',
  },
  {
    number: '03',
    title: 'Create Your Order',
    description: 'Enter order details or upload proformas and photos to relate to your order from multiple suppliers.',
    details: 'Creating orders is flexible and easy. You can manually enter order details for each supplier, or simply upload proforma invoices and product photos. Our system will organize everything related to your order, even when working with multiple suppliers.',
  },
  {
    number: '04',
    title: 'Track & Manage Shipments',
    description: 'Monitor your consolidated shipments in real-time and access all your documents in one place.',
    details: 'Our advanced tracking system gives you real-time updates on your shipments. You can view consolidated tracking information, access all shipping documents, and receive notifications about important shipping milestones.',
  },
  {
    number: '05',
    title: 'Make One Payment',
    description: 'Pay for all your orders with a single transaction, simplifying your accounting process.',
    details: 'Instead of managing multiple payments to different suppliers, make a single consolidated payment through our secure payment system. This simplifies your accounting and gives you clearer oversight of your import expenses.',
  },
];

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="how-it-works" className="py-20 bg-groop-dark relative">
      {/* Background elements */}
      <div className="absolute inset-0 bg-cyber-grid bg-[length:50px_50px] opacity-10"></div>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-groop-cyan/5 blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full bg-groop-purple/5 blur-[120px]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-groop-surface backdrop-blur-sm border border-groop-blue/20 text-sm text-groop-cyan mb-6">
            Simple Process
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-groop-accent mb-4">
            How <span className="text-groop-cyan">Groop</span> Works
          </h2>
          <p className="text-groop-accent-muted max-w-2xl mx-auto">
            Follow these simple steps to start consolidating your imports from Türkiye.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`relative ${index < steps.length - 1 ? 'after:hidden lg:after:block after:content-[""] after:absolute after:top-1/2 after:left-full after:w-full after:h-[1px] after:bg-groop-cyan/30 after:-translate-y-1/2 after:z-0' : ''}`}
            >
              <button
                onClick={() => setActiveStep(index)}
                className={`relative z-10 w-full flex flex-col items-center p-4 rounded-xl transition-all duration-300 ${activeStep === index ? 'bg-groop-surface backdrop-blur-sm border border-groop-blue/20' : 'hover:bg-groop-surface/50'}`}
              >
                <div 
                  className={`w-12 h-12 flex items-center justify-center rounded-full mb-4 transition-all duration-300 ${
                    activeStep === index 
                      ? 'bg-gradient-to-r from-groop-blue to-groop-cyan text-white shadow-lg shadow-groop-blue/20' 
                      : activeStep > index 
                        ? 'bg-groop-purple/20 text-groop-purple-light' 
                        : 'bg-groop-blue/10 text-groop-blue-light'
                  }`}
                >
                  {activeStep > index ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <span className="font-bold">{step.number}</span>
                  )}
                </div>
                <h3 className={`text-center font-medium transition-all duration-300 ${activeStep === index ? 'text-groop-accent' : 'text-groop-accent-muted'}`}>
                  {step.title}
                </h3>
              </button>
            </div>
          ))}
        </div>
        
        <div className="bg-groop-surface backdrop-blur-sm p-8 rounded-2xl border border-groop-blue/20 mb-16 animate-fade-in relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-groop-blue/5 blur-xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-groop-purple/5 blur-xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-groop-blue to-groop-cyan flex items-center justify-center text-white text-sm font-bold mr-3">
                {steps[activeStep].number}
              </div>
              <h3 className="text-2xl font-semibold text-groop-accent">{steps[activeStep].title}</h3>
            </div>
            <p className="text-groop-accent-muted mb-6">{steps[activeStep].details}</p>
            <div className="flex justify-end">
              <div className="flex gap-4">
                <CustomButton 
                  variant="outline"
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0}
                  className="border-groop-blue/30 text-groop-accent-muted hover:bg-groop-blue/10 hover:text-groop-accent"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </CustomButton>
                <CustomButton 
                  variant="primary"
                  onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                  disabled={activeStep === steps.length - 1}
                  className="bg-gradient-to-r from-groop-blue to-groop-cyan hover:from-groop-cyan hover:to-groop-blue text-white"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </CustomButton>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <CustomButton size="lg" className="bg-gradient-to-r from-groop-blue to-groop-cyan hover:from-groop-cyan hover:to-groop-blue text-white px-8 py-6 rounded-xl shadow-lg shadow-groop-blue/20">
            Start Your Import Journey
          </CustomButton>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
