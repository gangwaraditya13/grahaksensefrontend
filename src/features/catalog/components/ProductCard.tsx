import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductResponseDto } from '@/shared/types/api';
import { formatINR, calculateEffectivePrice } from '@/shared/lib/utils';
import { useCartStore } from '@/features/cart/store/cartStore';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { ShoppingCart, ImageOff } from 'lucide-react';
import { toast } from 'sonner';

import { activityTracker } from '@/shared/lib/activityTracker';

interface ProductCardProps {
  product: ProductResponseDto;
  isRecommendation?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, isRecommendation }) => {
  const { addItem } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  const [imageError, setImageError] = useState(false);

  const { originalPrice, finalPrice, effectiveDiscountPercent } =
    calculateEffectivePrice(
      product.price,
      product.discount,
      product.adminDiscount
    );

  const mainImageUrl = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : null;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    try {
      await addItem(product, 1);
      toast.success('Added to Cart', {
        description: `${product.productName} has been added to your shopping bag.`,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleClickProduct = () => {
    if (isRecommendation) {
      activityTracker.clickRecommendation(product.id);
    } else {
      activityTracker.clickProduct(product.id);
    }
  };

  return (
    <div
      onClick={handleClickProduct}
      className="group relative flex flex-col rounded-lg border border-border bg-surface overflow-hidden transition-all duration-300 hover:border-gold/60 hover:shadow-gold-glow"
    >
      {/* Product Image Area */}
      <Link
        to={`/products/${product.id}`}
        className="relative aspect-square w-full overflow-hidden bg-surface-secondary block"
      >
        {mainImageUrl && !imageError ? (
          <img
            src={mainImageUrl}
            alt={product.productName}
            loading="lazy"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-muted/50 p-4">
            <ImageOff className="h-10 w-10 mb-2 stroke-1 text-gold/40" />
            <span className="text-[11px] uppercase tracking-wider text-muted">
              GrahakSense Luxury
            </span>
          </div>
        )}

        {/* Discount Badge */}
        {effectiveDiscountPercent > 0 && (
          <div className="absolute top-2.5 left-2.5">
            <Badge variant="discount">
              {effectiveDiscountPercent}% OFF
            </Badge>
          </div>
        )}

        {/* Quick View Overlay on Hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Button
            size="sm"
            variant="gold"
            onClick={handleAddToCart}
            isLoading={isAdding}
            className="shadow-md text-xs font-semibold"
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
            Add to Bag
          </Button>
        </div>
      </Link>

      {/* Product Details Area */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <Link to={`/products/${product.id}`}>
            <h3 className="font-serif text-sm font-semibold text-foreground line-clamp-1 group-hover:text-gold transition-colors">
              {product.productName}
            </h3>
          </Link>
          <p className="text-xs text-muted line-clamp-2 mt-1 leading-relaxed">
            {product.productDescription || 'Handcrafted luxury piece designed for exceptional standards.'}
          </p>
        </div>

        {/* Pricing in INR */}
        <div className="pt-2 flex items-baseline justify-between border-t border-border/40">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-base text-foreground">
              {formatINR(finalPrice)}
            </span>
            {effectiveDiscountPercent > 0 && (
              <span className="text-xs text-muted line-through">
                {formatINR(originalPrice)}
              </span>
            )}
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={handleAddToCart}
            disabled={isAdding}
            aria-label="Add to cart"
            className="h-8 w-8 text-muted hover:text-gold hover:bg-gold/10"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
