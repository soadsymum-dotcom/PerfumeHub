import { useEffect, useState } from 'react';

interface ResilientImageProps {
  src: string;
  fallbackSrc?: string;
  alt: string;
  title?: string;
  className?: string;
  containerClassName?: string;
}

export function ResilientImage({
  src,
  fallbackSrc,
  alt,
  title,
  className = 'w-full h-full object-cover',
  containerClassName = '',
}: ResilientImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      return;
    }
    setHasError(true);
  };

  if (hasError || !currentSrc) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#1C1A17] via-[#121212] to-[#262016] text-[#C5A059] p-6 text-center ${containerClassName}`}
        role="img"
        aria-label={alt}
      >
        <svg
          viewBox="0 0 36 44"
          className="w-8 h-10 mb-3 text-[#C5A059]/75"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          aria-hidden="true"
        >
          <rect x="13" y="2" width="10" height="6" rx="1" />
          <path d="M15 8h6v4h-6z" />
          <rect x="7" y="12" width="22" height="29" rx="2" />
          <line x1="11" y1="22" x2="25" y2="22" />
        </svg>
        <span className="font-serif text-sm tracking-wide text-[#FAF9F6]/85">
          {title || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={handleError}
      className={className}
    />
  );
}
