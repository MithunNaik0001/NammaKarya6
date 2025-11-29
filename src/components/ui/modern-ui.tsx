"use client";

import React from 'react';

interface ModernCardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
    hoverable?: boolean;
    padding?: 'sm' | 'md' | 'lg' | 'xl';
}

export function ModernCard({
    children,
    className = '',
    variant = 'default',
    hoverable = true,
    padding = 'lg'
}: ModernCardProps) {
    const baseClasses = 'rounded-xl border transition-all duration-300 ease-in-out';

    const variantClasses = {
        default: 'bg-white border-gray-200 shadow-md',
        elevated: 'bg-white border-gray-200 shadow-xl',
        outlined: 'bg-white border-2 border-primary shadow-sm',
        gradient: 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg'
    };

    const paddingClasses = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-12'
    };

    const hoverClasses = hoverable
        ? 'hover:shadow-2xl hover:-translate-y-2 hover:border-primary/50'
        : '';

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClasses} ${className}`}
        >
            {children}
        </div>
    );
}

interface ModernButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
}

export function ModernButton({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    className = '',
    type = 'button'
}: ModernButtonProps) {
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl border transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
        primary: 'bg-gradient-to-r from-primary to-primary-dark text-white border-transparent hover:from-primary-dark hover:to-primary shadow-lg hover:shadow-xl focus:ring-primary/25',
        secondary: 'bg-white text-primary border-primary hover:bg-primary hover:text-white shadow-md hover:shadow-lg focus:ring-primary/25',
        success: 'bg-gradient-to-r from-success to-green-600 text-white border-transparent hover:from-green-600 hover:to-success shadow-lg hover:shadow-xl focus:ring-success/25',
        error: 'bg-gradient-to-r from-error to-red-600 text-white border-transparent hover:from-red-600 hover:to-error shadow-lg hover:shadow-xl focus:ring-error/25',
        warning: 'bg-gradient-to-r from-warning to-yellow-600 text-white border-transparent hover:from-yellow-600 hover:to-warning shadow-lg hover:shadow-xl focus:ring-warning/25',
        ghost: 'bg-transparent text-gray-700 border-transparent hover:bg-gray-100 focus:ring-gray/25'
    };

    const sizeClasses = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
        xl: 'px-10 py-5 text-xl'
    };

    const widthClass = fullWidth ? 'w-full' : '';
    const hoverClass = !disabled ? 'hover:-translate-y-1' : '';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${hoverClass} ${className}`}
        >
            {loading && (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {children}
        </button>
    );
}

interface ModernInputProps {
    label?: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    hint?: string;
    icon?: React.ReactNode;
    className?: string;
}

export function ModernInput({
    label,
    placeholder,
    value,
    onChange,
    type = 'text',
    required = false,
    disabled = false,
    error,
    hint,
    icon,
    className = ''
}: ModernInputProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-error ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {icon}
                    </div>
                )}

                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    className={`
            w-full px-4 py-3 ${icon ? 'pl-10' : ''} 
            border-2 border-gray-200 rounded-xl 
            bg-white text-gray-900 
            placeholder-gray-500
            transition-all duration-300 ease-in-out
            focus:outline-none focus:ring-4 focus:ring-primary/25 focus:border-primary
            hover:border-gray-300
            disabled:bg-gray-50 disabled:cursor-not-allowed
            ${error ? 'border-error focus:border-error focus:ring-error/25' : ''}
          `}
                />
            </div>

            {error && (
                <p className="text-sm text-error flex items-center gap-1">
                    <span>⚠️</span> {error}
                </p>
            )}

            {hint && !error && (
                <p className="text-sm text-gray-500">{hint}</p>
            )}
        </div>
    );
}

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'success' | 'error' | 'warning' | 'info' | 'gray';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function Badge({
    children,
    variant = 'primary',
    size = 'md',
    className = ''
}: BadgeProps) {
    const baseClasses = 'inline-flex items-center font-medium rounded-full';

    const variantClasses = {
        primary: 'bg-primary-light text-primary border border-primary/20',
        success: 'bg-success-light text-green-800 border border-success/20',
        error: 'bg-error-light text-red-800 border border-error/20',
        warning: 'bg-warning-light text-yellow-800 border border-warning/20',
        info: 'bg-info-light text-blue-800 border border-info/20',
        gray: 'bg-gray-100 text-gray-800 border border-gray-200'
    };

    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base'
    };

    return (
        <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
            {children}
        </span>
    );
}

export { ModernCard as Card };
export { ModernButton as Button };
export { ModernInput as Input };