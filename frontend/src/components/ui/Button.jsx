import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    isLoading = false,
    disabled = false,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none hover:-translate-y-0.5 active:translate-y-0 shadow-sm hover:shadow-lg relative overflow-hidden';

    const variants = {
        primary: 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white focus:ring-indigo-500 border border-indigo-400/30',
        secondary: 'bg-white/80 backdrop-blur-md text-gray-700 border border-gray-200/50 hover:bg-white focus:ring-indigo-500 shadow-sm',
        danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500 border border-red-400/30',
        ghost: 'bg-transparent text-gray-600 hover:bg-white/50 hover:text-gray-900 focus:ring-gray-500 shadow-none hover:shadow-sm border border-transparent',
    };

    const sizes = {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
};
