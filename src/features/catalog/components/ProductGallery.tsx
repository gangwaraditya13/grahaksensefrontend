import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface ProductGalleryProps {
  images?: string[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images = [],
  productName,
}) => {
  const validImages = images.filter((img) => img && img.trim().length > 0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const currentImage = validImages[selectedIndex];

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails (Vertical on medium+ screens, horizontal on mobile) */}
      {validImages.length > 1 && (
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[500px] shrink-0 scrollbar-thin">
          {validImages.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              onClick={() => {
                setSelectedIndex(idx);
                setHasError(false);
              }}
              className={cn(
                'relative h-16 w-16 md:h-20 md:w-20 rounded-md overflow-hidden border-2 bg-surface-secondary transition-all',
                selectedIndex === idx
                  ? 'border-gold shadow-gold-glow scale-95'
                  : 'border-border/60 hover:border-border opacity-70 hover:opacity-100'
              )}
            >
              <img
                src={img}
                alt={`${productName} thumbnail ${idx + 1}`}
                className="h-full w-full object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Large Display Viewport */}
      <div className="relative flex-1 aspect-square rounded-lg border border-border bg-surface overflow-hidden group">
        {currentImage && !hasError ? (
          <img
            src={currentImage}
            alt={productName}
            onError={() => setHasError(true)}
            className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center bg-surface-secondary text-muted/60 p-8">
            <ImageOff className="h-16 w-16 text-gold/40 mb-3 stroke-1" />
            <p className="font-serif text-sm font-medium text-foreground">
              {productName}
            </p>
            <span className="text-xs uppercase tracking-widest text-muted mt-1">
              GrahakSense Collection
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
