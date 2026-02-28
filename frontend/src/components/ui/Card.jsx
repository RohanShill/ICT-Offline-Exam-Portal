import React from 'react';

export const Card = ({ children, className = '' }) => {
    return (
        <div className={`glass-panel rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl ${className}`}>
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className = '' }) => {
    return (
        <div className={`px-8 py-6 border-b border-white/40 bg-white/20 backdrop-blur-md ${className}`}>
            {children}
        </div>
    );
};

export const CardContent = ({ children, className = '' }) => {
    return (
        <div className={`px-8 py-6 ${className}`}>
            {children}
        </div>
    );
};

export const CardTitle = ({ children, className = '' }) => {
    return (
        <h2 className={`text-xl font-semibold text-gray-800 tracking-tight ${className}`}>
            {children}
        </h2>
    );
};

export const CardFooter = ({ children, className = '' }) => {
    return (
        <div className={`px-8 py-6 bg-gray-50/30 border-t border-white/40 backdrop-blur-md ${className}`}>
            {children}
        </div>
    );
};
