
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, ariaLabel }) => (
  <div 
    role={onClick ? 'button' : 'article'}
    tabIndex={onClick ? 0 : undefined}
    aria-label={ariaLabel}
    onClick={onClick}
    onKeyDown={(e) => {
      if (onClick && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick();
      }
    }}
    className={`bg-white rounded-[2rem] border border-[#EBE8E0] shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-500 focus-within:ring-2 focus-within:ring-[#E2725B] focus-within:ring-offset-4 outline-none ${onClick ? 'cursor-pointer hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 active:scale-[0.98]' : ''} ${className}`}
  >
    {children}
  </div>
);

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'terracotta' | 'sage' | 'mustard' | 'slate' | 'red';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'slate', className = '' }) => {
  const variants = {
    terracotta: 'bg-[#FBE9E4] text-[#E2725B] border-[#F5D5CE]',
    sage: 'bg-[#F2F5F0] text-[#5B7A4B] border-[#E5EBE0]',
    mustard: 'bg-[#FFF9E5] text-[#B38A00] border-[#FFECB3]',
    slate: 'bg-slate-900 text-white border-transparent',
    red: 'bg-red-50 text-red-700 border-red-100'
  };
  return (
    <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

interface FormFieldProps {
  label: string;
  error?: string;
  id?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, error, id, children }) => {
  const generatedId = id || React.useId();
  return (
    <div className="space-y-2">
      <label htmlFor={generatedId} className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A6A196] ml-1">
        {label}
      </label>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { id: generatedId });
        }
        return child;
      })}
      {error && (
        <p role="alert" className="text-[10px] font-bold text-red-500 ml-1">
          {error}
        </p>
      )}
    </div>
  );
};

export const AccessibilityAnnouncer: React.FC<{ message: string }> = ({ message }) => (
  <div 
    className="sr-only" 
    role="status" 
    aria-live="polite" 
    aria-atomic="true"
  >
    {message}
  </div>
);
