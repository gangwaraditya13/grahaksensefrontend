import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProductDetailQuery, useProductsQuery } from '../hooks/useProducts';
import { ProductGallery } from '../components/ProductGallery';
import { ProductCard } from '../components/ProductCard';
import { activityTracker } from '@/shared/lib/activityTracker';
import { useCartStore } from '@/features/cart/store/cartStore';
import { calculateEffectivePrice, formatINR } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import {
  ShoppingCart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Plus,
  Minus,
  ArrowLeft,
  Store,
  Lock,
  LogIn,
  UserPlus,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id || '0', 10);

  const { isGuest, isForbidden } = useProductsQuery();
  const { data: product, isLoading, isError } = useProductDetailQuery(productId);
  const { products: allProducts = [] } = useProductsQuery();
  const { addItem } = useCartStore();

  // Related products from same seller or other catalog items
  const relatedProducts = allProducts
    .filter((p) => p.id !== product?.id)
    .slice(0, 4);

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Telemetry: Log VIEW_PRODUCT on mount only for authenticated users
  useEffect(() => {
    if (!isGuest && !isForbidden && productId && !isNaN(productId)) {
      activityTracker.viewProduct(productId);
    }
  }, [productId, isGuest, isForbidden]);

  // Telemetry: Log VIEW_RECOMMENDATION when related products are rendered
  useEffect(() => {
    if (!isGuest && !isForbidden && relatedProducts.length > 0) {
      activityTracker.viewRecommendation(relatedProducts[0].id);
    }
  }, [relatedProducts.length, isGuest, isForbidden]);

  if (isGuest) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="relative rounded-2xl border border-gold/40 bg-gradient-to-br from-surface via-surface-secondary to-surface p-8 sm:p-12 overflow-hidden shadow-gold-glow">
          <div className="relative z-10 max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2">
              <div className="h-9 w-9 rounded-md bg-gold/15 border border-gold/40 flex items-center justify-center text-gold">
                <Lock className="h-4 w-4" />
              </div>
              <Badge variant="gold">Member Access Required</Badge>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
              Sign In to Inspect Product Specifications
            </h1>

            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Product details, high-resolution imagery, and shopping bag actions are restricted
              to authenticated accounts. Please sign in or create an account to view this item.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to={`/login?returnTo=${encodeURIComponent(`/products/${productId}`)}`}>
                <Button variant="gold" size="lg" className="gap-2 shadow-gold-glow">
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </Button>
              </Link>
              <Link to={`/signup?returnTo=${encodeURIComponent(`/products/${productId}`)}`}>
                <Button variant="outline" size="lg" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Create Account</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isForbidden) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <ShieldAlert className="h-10 w-10 text-gold mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-foreground">
          Storefront Access Restricted
        </h2>
        <p className="text-sm text-muted">
          Your account holds the ADMIN role. Storefront shopping is restricted to customer USER accounts.
        </p>
        <Link to="/admin/products">
          <Button variant="gold">Open Product Moderation</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-lg w-full" />
          <div className="space-y-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-48" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          Product Not Found
        </h2>
        <p className="text-sm text-muted">
          The requested product does not exist or has been removed from our catalog.
        </p>
        <Link to="/products">
          <Button variant="primary" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Catalog</span>
          </Button>
        </Link>
      </div>
    );
  }

  const {
    originalPrice,
    totalDiscountAmount,
    finalPrice,
    effectiveDiscountPercent,
  } = calculateEffectivePrice(
    product.price,
    product.discount,
    product.adminDiscount
  );

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addItem(product, quantity);
      toast.success('Added to Shopping Bag', {
        description: `${quantity} × ${product.productName} added.`,
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Back link */}
      <div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted hover:text-gold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Product Catalog</span>
        </Link>
      </div>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Gallery */}
        <ProductGallery
          images={product.imageUrls}
          productName={product.productName}
        />

        {/* Right: Info & Purchase Controls */}
        <div className="space-y-6">
          {/* Badges & Seller Indicator */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="gold">Verified Luxury</Badge>
            {effectiveDiscountPercent > 0 && (
              <Badge variant="discount">{effectiveDiscountPercent}% OFF</Badge>
            )}
            <Link
              to={`/products?sellerId=${product.sellerId}`}
              onClick={() => activityTracker.viewSeller()}
              className="flex items-center gap-1 text-xs text-muted hover:text-gold transition-colors ml-auto"
            >
              <Store className="h-3.5 w-3.5 text-gold" />
              <span>Seller #{product.sellerId}</span>
            </Link>
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {product.productName}
          </h1>

          {/* Pricing Section in INR */}
          <div className="p-4 rounded-lg border border-border bg-surface-secondary space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-3xl font-bold text-foreground">
                {formatINR(finalPrice)}
              </span>
              {effectiveDiscountPercent > 0 && (
                <span className="text-sm text-muted line-through">
                  {formatINR(originalPrice)}
                </span>
              )}
            </div>

            {effectiveDiscountPercent > 0 && (
              <p className="text-xs text-emerald-400 font-medium">
                You save {formatINR(totalDiscountAmount)} ({effectiveDiscountPercent}% discount applied)
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Description & Specifications
            </h3>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
              {product.productDescription ||
                'This exclusive item is crafted with premium quality standards, delivering optimal comfort, durability, and distinguished design.'}
            </p>
          </div>

          {/* Quantity Selector & Add to Cart */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border rounded-md bg-surface">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2.5 text-muted hover:text-foreground transition-colors disabled:opacity-40"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm font-semibold text-foreground">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-2.5 text-muted hover:text-foreground transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Button
                size="lg"
                variant="gold"
                onClick={handleAddToCart}
                isLoading={isAdding}
                className="flex-1 gap-2 shadow-gold-glow"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Shopping Bag</span>
              </Button>
            </div>
          </div>

          {/* Value Props & Assurance */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/60 text-center">
            <div className="p-3 rounded-md bg-surface border border-border/80 space-y-1">
              <Truck className="h-4 w-4 text-gold mx-auto" />
              <p className="text-[11px] font-medium text-foreground">Insured Delivery</p>
              <p className="text-[10px] text-muted">Across India</p>
            </div>
            <div className="p-3 rounded-md bg-surface border border-border/80 space-y-1">
              <ShieldCheck className="h-4 w-4 text-gold mx-auto" />
              <p className="text-[11px] font-medium text-foreground">100% Genuine</p>
              <p className="text-[10px] text-muted">Direct from Seller</p>
            </div>
            <div className="p-3 rounded-md bg-surface border border-border/80 space-y-1">
              <RotateCcw className="h-4 w-4 text-gold mx-auto" />
              <p className="text-[11px] font-medium text-foreground">Hassle-Free</p>
              <p className="text-[10px] text-muted">7-Day Guarantee</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations & Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-12 border-t border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold" />
            <h2 className="font-serif text-2xl font-bold text-foreground">
              You May Also Like
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} isRecommendation={true} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
