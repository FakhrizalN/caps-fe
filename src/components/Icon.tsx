import * as HeroiconsOutline from '@heroicons/react/24/outline';
import * as HeroiconsSolid from '@heroicons/react/24/solid';
import React from 'react';

interface IconProps {
  name: string;
  variant?: 'outline' | 'solid';
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, variant = 'outline', className = "" }) => {
  // Convert kebab-case to PascalCase for Heroicons component names
  const toPascalCase = (str: string) => {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('') + 'Icon';
  };

  const iconName = toPascalCase(name);
  
  // Get the appropriate icon set
  const iconSet = variant === 'solid' ? HeroiconsSolid : HeroiconsOutline;
  
  // Get the icon component
  const IconComponent = (iconSet as any)[iconName];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in Heroicons ${variant} set`);
    return null;
  }

  // Base icon classes with proper positioning for button layout
  const iconClasses = `size-[15px] left-[1.50px] top-[1.50px] absolute ${className}`;
  
  return (
    <div className={iconClasses}>
      <IconComponent className="w-full h-full" />
    </div>
  );
};

export default Icon;