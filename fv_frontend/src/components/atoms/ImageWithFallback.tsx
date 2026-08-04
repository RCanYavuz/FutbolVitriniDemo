import React, { useState } from 'react';
import { User } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackIconSize?: number;
  containerClassName?: string;
}

export default function ImageWithFallback({
  src,
  alt,
  className = '',
  containerClassName = '',
  fallbackIconSize = 32,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-surface-container-high text-text-muted ${containerClassName} ${className}`}
      >
        <User size={fallbackIconSize} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || 'Image'}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
}
