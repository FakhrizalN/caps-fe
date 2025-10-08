import React, { forwardRef, useState } from 'react';
import Icon from '../Icon';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  state?: 'default' | 'focused' | 'error' | 'disabled' | 'placeholder' | 'filled';
  leftIcon?: string;
  rightIcon?: string;
  actionIcon?: string;
  onActionClick?: () => void;
  showPasswordToggle?: boolean;
  showCursor?: boolean;
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  state = 'default',
  leftIcon,
  rightIcon,
  actionIcon,
  onActionClick,
  showPasswordToggle = false,
  showCursor = false,
  className = '',
  type = 'text',
  disabled,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Determine current state - outline biru hanya saat focused
  let currentState = state;
  
  // Jika ada explicit state error atau disabled, gunakan itu
  if (state === 'error' || state === 'disabled') {
    currentState = state;
  }
  // Jika sedang focused dan bukan disabled/error, tampilkan focused
  else if (isFocused && !disabled) {
    currentState = 'focused';
  }
  // Jika tidak focused, gunakan state default (tidak ada outline biru)
  else {
    currentState = 'default';
  }

  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  const getContainerClasses = () => {
    const baseClasses = "self-stretch h-[38px] px-3.5 py-[7px] rounded-lg inline-flex justify-start items-center gap-2.5 overflow-hidden";
    
    switch (currentState) {
      case 'focused':
        return `${baseClasses} bg-white shadow-[0px_0.5px_2px_0px_rgba(0,0,0,0.05)] outline outline-2 outline-offset-[-2px] outline-primary-700`;
      case 'error':
        return `${baseClasses} bg-white shadow-[0px_0.5px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-danger-600`;
      case 'disabled':
        return `${baseClasses} bg-gray-50 shadow-[0px_0px_0px_1px_rgba(229,229,229,1.00)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)]`;
      default:
        // Default state untuk semua kondisi non-focused (filled, placeholder, default)
        return `${baseClasses} bg-white shadow-[0px_0px_0px_1px_rgba(229,229,229,1.00)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)]`;
    }
  };

  const getInputContentClasses = () => {
    if (currentState === 'focused') {
      return "flex-1 flex justify-start items-center gap-0.5";
    }
    return "flex-1 justify-start";
  };

  const getTextClasses = () => {
    if (disabled || state === 'disabled') {
      return 'text-gray-500';
    }
    
    // Jika ada value (terisi), tampilkan dengan warna normal
    if (props.value || props.defaultValue) {
      return 'text-gray-900';
    }
    
    // Jika placeholder, tampilkan dengan warna placeholder
    if (props.placeholder && !props.value && !props.defaultValue) {
      return 'text-gray-400';
    }
    
    return 'text-gray-800';
  };

  const getTextOpacity = () => {
    // Untuk state "empty" di mana teks harus opacity-0
    if (!props.placeholder && !props.value && !props.defaultValue && state === 'default') {
      return 'opacity-0';
    }
    return '';
  };

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  const effectiveActionIcon = showPasswordToggle 
    ? (showPassword ? 'eye-slash' : 'eye') 
    : actionIcon;

  const effectiveOnActionClick = showPasswordToggle 
    ? handlePasswordToggle 
    : onActionClick;

  const getIconOpacity = () => {
    if (disabled || state === 'disabled') {
      return 'opacity-50';
    }
    return '';
  };

  const getActionContainerHeight = () => {
    if (currentState === 'focused') {
      return 'h-[34px]';
    }
    if (currentState === 'error') {
      return 'h-9';
    }
    return 'h-[38px]';
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (props.onFocus) {
      props.onFocus(event);
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (props.onBlur) {
      props.onBlur(event);
    }
  };

  return (
    <div className={`${getContainerClasses()} ${className}`}>
      {/* Left Icon */}
      {leftIcon && (
        <div className={`size-5 relative overflow-hidden ${getIconOpacity()}`}>
          <Icon name={leftIcon} className="text-gray-500" />
        </div>
      )}

      {/* Input Content */}
      <div className={getInputContentClasses()}>
        <input
          ref={ref}
          type={inputType}
          disabled={disabled || state === 'disabled'}
          className={`justify-start text-sm font-normal font-inter leading-normal bg-transparent border-none outline-none ${getTextClasses()} ${getTextOpacity()}`}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{ width: currentState === 'focused' ? 'auto' : '100%' }}
          {...props}
        />

 
        
        {/* Spacer untuk focused state */}
        {currentState === 'focused' && (
          <div className="flex-1 h-6" />
        )}
      </div>

      {/* Right Icon */}
      {rightIcon && (
        <div className={`size-5 relative overflow-hidden ${getIconOpacity()}`}>
          <Icon name={rightIcon} className="text-gray-500" />
        </div>
      )}

      {/* Action Icon with Border */}
      {effectiveActionIcon && (
        <div className={`${getActionContainerHeight()} pl-3 py-[7px] ${currentState !== 'focused' ? 'bg-white' : ''} border-l border-gray-200 flex justify-start items-center gap-2.5`}>
          <button
            type="button"
            onClick={effectiveOnActionClick}
            className="size-5 relative overflow-hidden cursor-pointer"
            disabled={disabled || state === 'disabled'}
          >
            <Icon name={effectiveActionIcon} className="text-gray-400" />
          </button>
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;