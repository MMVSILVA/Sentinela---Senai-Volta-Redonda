import React from 'react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-10 h-10 text-xl',
    lg: 'w-16 h-16 text-3xl',
  };

  return (
    <div 
      className={cn(
        "bg-white rounded-xl flex items-center justify-center font-black shadow-lg",
        sizeClasses[size],
        className
      )}
    >
      <span className="text-blue-600 leading-none select-none">S</span>
    </div>
  );
}
