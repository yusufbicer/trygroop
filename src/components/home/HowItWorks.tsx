
import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
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
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-groop-blue/5 blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full bg-groop-blue/5 blur-[120px]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-groop-blue/10 border border-groop-blue/20 text-sm text-groop-blue mb-6">
            Simple Process
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How Groop Works
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Follow these simple steps to start consolidating your imports from Turkey.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`relative ${index < steps.length - 1 ? 'after:hidden lg:after:block after:content-[""] after:absolute after:top-1/2 after:left-full after:w-full after:h-[1px] after:bg-groop-blue/30 after:-translate-y-1/2 after:z-0' : ''}`}
            >
              <button
                onClick={() => setActiveStep(index)}
                className={`relative z-10 w-full flex flex-col items-center p-4 rounded-xl transition-all duration-300 ${activeStep === index ? 'bg-white/5 border border-white/10' : 'hover:bg-white/5'}`}
              >
                <div 
                  className={`w-12 h-12 flex items-center justify-center rounded-full mb-4 transition-all duration-300 ${activeStep === index ? 'bg-groop-blue text-white' : 'bg-groop-blue/10 text-groop-blue'}`}
                >
                  {activeStep > index ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <span className="font-bold">{step.number}</span>
                  )}
                </div>
                <h3 className={`text-center font-medium transition-all duration-300 ${activeStep === index ? 'text-white' : 'text-white/70'}`}>
                  {step.title}
                </h3>
              </button>
            </div>
          ))}
        </div>
        
        <div className="glass p-8 rounded-2xl border border-white/10 mb-16 animate-fade-in">
          <h3 className="text-2xl font-semibold text-white mb-4">{steps[activeStep].title}</h3>
          <p className="text-white/80 mb-6">{steps[activeStep].details}</p>
          <div className="flex justify-end">
            <div className="flex gap-4">
              <CustomButton 
                variant="outline"
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
              >
                Previous
              </CustomButton>
              <CustomButton 
                variant="primary"
                onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                disabled={activeStep === steps.length - 1}
              >
                Next
              </CustomButton>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <CustomButton size="lg">
            Start Your Import Journey
          </CustomButton>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
