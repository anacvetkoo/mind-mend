import React from 'react';
import otterImage from '../../../imports/vidra.png';

interface OtterMascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  emotion?: 'happy' | 'calm' | 'thinking' | 'excited' | 'supportive';
  animate?: boolean;
}

export function OtterMascot({ size = 'md' }: OtterMascotProps) {
  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48'
  };

  return (
    <div className={`${sizes[size]} flex items-center justify-center mx-auto`}>
      <img
        src={otterImage}
        alt="Otto the Otter"
        className="w-full h-full object-contain"
      />
    </div>
  );
}
