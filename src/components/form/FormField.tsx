import React from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  helperText?: string;
  errorMessage?: string;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  children,
  helperText,
  errorMessage,
  className = ''
}) => {
  const hasError = Boolean(errorMessage);

  return (
    <div className={`w-full inline-flex flex-col justify-start items-start gap-2 ${className}`}>
      {/* Label */}
      <div className="self-stretch inline-flex justify-start items-start gap-0.5">
        <div className={`justify-start text-sm font-medium font-inter leading-tight ${hasError ? 'text-danger-700' : 'text-gray-900'}`}>
          {label}
        </div>
        {required && (
          <div className="justify-start text-danger-600 text-xs font-medium font-inter leading-tight">
            *
          </div>
        )}
      </div>

      {/* Field Content */}
      {children}

      {/* Error Message */}
      {errorMessage && (
        <div className="self-stretch justify-start text-danger-600 text-sm font-normal font-inter leading-tight">
          {errorMessage}
        </div>
      )}

      {/* Helper Text */}
      {helperText && !errorMessage && (
        <div className="self-stretch justify-start text-gray-500 text-sm font-normal font-inter leading-tight">
          {helperText}
        </div>
      )}
    </div>
  );
};

export default FormField;