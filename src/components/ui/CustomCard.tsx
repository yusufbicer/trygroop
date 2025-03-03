
import React from 'react';
import { cn } from '@/lib/utils';

interface CustomCardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  glassEffect?: boolean;
  children: React.ReactNode;
}

const CustomCard = React.forwardRef<HTMLDivElement, CustomCardProps>(
  ({ className, interactive = false, glassEffect = true, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          'rounded-xl overflow-hidden transition-all duration-300',
          glassEffect ? 'glass-card' : 'bg-groop-dark border border-groop-darker',
          interactive && 'glass-card-hover hover:translate-y-[-2px]',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CustomCard.displayName = 'CustomCard';

interface CustomCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CustomCardHeader = React.forwardRef<HTMLDivElement, CustomCardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn('p-6', className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CustomCardHeader.displayName = 'CustomCardHeader';

interface CustomCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CustomCardContent = React.forwardRef<HTMLDivElement, CustomCardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn('p-6 pt-0', className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CustomCardContent.displayName = 'CustomCardContent';

interface CustomCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CustomCardFooter = React.forwardRef<HTMLDivElement, CustomCardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn('p-6 pt-0 flex items-center justify-between', className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CustomCardFooter.displayName = 'CustomCardFooter';

export { CustomCard, CustomCardHeader, CustomCardContent, CustomCardFooter };
