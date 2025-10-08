import React from 'react';

interface ButtonProps {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  icon,
  iconPosition = 'left'
}) => {
  const baseClasses = "inline-flex justify-center items-center rounded-lg font-semibold font-inter leading-tight transition-colors shadow-[0px_0.5px_2px_0px_rgba(0,0,0,0.05)]";
  
  const variantClasses = {
    primary: {
      default: "bg-primary-600 text-white hover:bg-primary-500 active:bg-primary-500 cursor-pointer",
      disabled: "bg-primary-600 text-white opacity-50 cursor-not-allowed"
    },
    secondary: {
      default: "bg-white text-gray-800 border border-gray-200 hover:bg-gray-100 active:bg-gray-100 cursor-pointer",
      disabled: "bg-white text-gray-800 border border-gray-200 opacity-50 cursor-not-allowed"
    },
    danger: {
      default: "bg-danger-600 text-white hover:bg-danger-500 active:bg-danger-500 cursor-pointer",
      disabled: "bg-danger-600 text-white opacity-50 cursor-not-allowed"
    }
  };
  
  // Check if it's small size with icon (icon only mode)
  const isIconOnly = size === 'sm' && icon;
  
  const sizeClasses = {
    // For icon-only small buttons, use specific dimensions with gap-1.5
    sm: isIconOnly ? "h-[26px] px-[11px] py-[3px] gap-1.5 text-sm" : "gap-1.5 px-[11px] py-[3px] text-sm",
    md: icon ? "gap-1.5 px-3 py-1.5 text-sm" : "gap-1.5 px-3 py-1.5 text-sm",
    lg: icon ? "gap-1.5 px-4 py-2 text-sm" : "gap-1.5 px-4 py-2 text-sm"
  };
  
  // Adjust padding for icons (only for md and lg)
  const iconPaddingClasses = {
    md: {
      left: icon ? "pl-2.5 pr-3" : "",
      right: icon ? "pl-3 pr-2.5" : "",
      none: "px-3"
    },
    lg: {
      left: icon ? "pl-3.5 pr-4" : "",
      right: icon ? "pl-4 pr-3.5" : "",
      none: "px-4"
    }
  };

  const getVariantClass = () => {
    return disabled ? variantClasses[variant].disabled : variantClasses[variant].default;
  };

  const getIconPadding = () => {
    // For small size with icon, don't apply icon padding (already handled in sizeClasses)
    if (isIconOnly) return "";
    
    // For small size without icon, use regular padding
    if (size === 'sm' && !icon) return "px-[11px]";
    
    // For md and lg sizes
    if ((size === 'md' || size === 'lg') && !icon) return iconPaddingClasses[size]?.none || "";
    if (size === 'md' || size === 'lg') {
      return iconPosition === 'left' ? iconPaddingClasses[size]?.left || "" : iconPaddingClasses[size]?.right || "";
    }
    return "";
  };

  const combinedClasses = `${baseClasses} ${getVariantClass()} ${sizeClasses[size]} ${getIconPadding()} ${className}`;
  
  const renderIcon = () => {
    if (!icon) return null;
    
    return (
      <div className="size-[18px] relative overflow-hidden">
        {icon}
      </div>
    );
  };

  const renderContent = () => {
    // For small size with icon, only show icon
    if (isIconOnly) {
      return renderIcon();
    }
    
    // For other cases, show text only or text with icon
    if (!icon) {
      return <div className="text-center">{children}</div>;
    }

    if (iconPosition === 'left') {
      return (
        <>
          {renderIcon()}
          <div className="text-center">{children}</div>
        </>
      );
    }

    return (
      <>
        <div className="text-center">{children}</div>
        {renderIcon()}
      </>
    );
  };

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={combinedClasses}
    >
      {renderContent()}
    </button>
  );
};

export default Button;