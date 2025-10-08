import React, { forwardRef } from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  state?: 'default' | 'error' | 'disabled';
  className?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  state = 'default',
  className = '',
  disabled,
  ...props
}, ref) => {
  const isDisabled = disabled || state === 'disabled';
  const hasError = state === 'error';

  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative">
        <input
          ref={ref}
          type="checkbox"
          disabled={isDisabled}
          className={`
            h-4 w-4 rounded border-gray-300 
            ${hasError ? 'border-danger-600 text-danger-600 focus:ring-danger-500' : 'text-primary-600 focus:ring-primary-500'}
            ${isDisabled ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : 'cursor-pointer'}
          `}
          {...props}
        />
      </div>
      <label 
        htmlFor={props.id}
        className={`
          ml-2 block text-sm font-normal font-inter leading-tight cursor-pointer
          ${isDisabled ? 'text-gray-400 cursor-not-allowed' : hasError ? 'text-danger-700' : 'text-gray-900'}
        `}
      >
        {label}
      </label>
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;