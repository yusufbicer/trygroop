
import React from 'react';
import { cn } from '@/lib/utils';

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isGlowing?: boolean;
  children: React.ReactNode;
}

const CustomButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, variant = 'primary', size = 'md', isGlowing = false, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-groop-dark focus:ring-groop-blue disabled:opacity-50 disabled:pointer-events-none';
    
    const variants = {
      primary: 'bg-groop-blue hover:bg-groop-blue/90 text-white',
      secondary: 'bg-white/10 hover:bg-white/15 text-white backdrop-blur-sm',
      outline: 'border border-white/20 bg-transparent hover:bg-white/5 text-white',
      ghost: 'bg-transparent hover:bg-white/5 text-white'
    };
    
    const sizes = {
      sm: 'text-xs px-3 py-1.5',
      md: 'text-sm px-4 py-2',
      lg: 'text-base px-6 py-3'
    };
    
    const glowClass = isGlowing ? 'btn-glow animate-glow-pulse' : '';
    
    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          glowClass,
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

CustomButton.displayName = 'CustomButton';

export { CustomButton };
