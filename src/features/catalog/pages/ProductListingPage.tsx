import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useProductsQuery } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { ProductFilters } from '../components/ProductFilters';
import { activityTracker } from '@/shared/lib/activityTracker';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { calculateEffectivePrice } from '@/shared/lib/utils';
import {
  PackageX,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Lock,
  LogIn,
  UserPlus,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

const ITEMS_PER_PAGE = 12;

export const ProductListingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const {
    products,
    isGuest,
    isForbidden,
    isLoading,
    isError,
    refetch,
  } = useProductsQuery();

  const [currentPage, setCurrentPage] = useState(1);

  // Extract filter parameters from URL
  const searchQuery = searchParams.get('q')?.toLowerCase() || '';
  const categoryParam = searchParams.get('category');
  const minPrice = parseFloat(searchParams.get('minPrice') || '0');
  const maxPrice = parseFloat(searchParams.get('maxPrice') || 'Infinity');
  const discountOnly = searchParams.get('discount') === 'true';
  const sortBy = searchParams.get('sort') || 'default';

  // Telemetry: Log VIEW_CATEGORY when category parameter is present
  useEffect(() => {
    if (categoryParam) {
      activityTracker.viewCategory();
    }
  }, [categoryParam]);

  // Apply filters and sorting
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Search filter (name or description)
        if (
          searchQuery &&
          !product.productName.toLowerCase().includes(searchQuery) &&
          !product.productDescription?.toLowerCase().includes(searchQuery)
        ) {
          return false;
        }

        const { finalPrice, effectiveDiscountPercent } = calculateEffectivePrice(
          product.price,
          product.discount,
          product.adminDiscount
        );

        // Price range filter
        if (finalPrice < minPrice || finalPrice > maxPrice) {
          return false;
        }

        // Discount filter
        if (discountOnly && effectiveDiscountPercent <= 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = calculateEffectivePrice(a.price, a.discount, a.adminDiscount).finalPrice;
        const priceB = calculateEffectivePrice(b.price, b.discount, b.adminDiscount).finalPrice;

        switch (sortBy) {
          case 'price-asc':
            return priceA - priceB;
          case 'price-desc':
            return priceB - priceA;
          case 'newest':
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          default:
            return 0; // Default order
        }
      });
  }, [products, searchQuery, minPrice, maxPrice, discountOnly, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-2 border-b border-border pb-6">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Luxury Catalog & Discovery
        </h1>
        <p className="text-sm text-muted">
          Browse our verified marketplace products with direct seller transparent pricing.
        </p>
      </div>

      {/* Guest View: Sign in required to view catalog */}
      {isGuest && (
        <div className="relative rounded-2xl border border-gold/40 bg-gradient-to-br from-surface via-surface-secondary to-surface p-8 sm:p-12 overflow-hidden shadow-gold-glow">
          <div className="relative z-10 max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2">
              <div className="h-9 w-9 rounded-md bg-gold/15 border border-gold/40 flex items-center justify-center text-gold">
                <Lock className="h-4 w-4" />
              </div>
              <Badge variant="gold">Member Access Required</Badge>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
              Sign In to Access Marketplace Catalog
            </h2>

            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Our live catalog and direct manufacturer pricing in INR are available to
              authenticated customers. Please sign in with your account or register to
              unlock real-time product search, filtering, and ordering.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/login?returnTo=%2Fproducts">
                <Button variant="gold" size="lg" className="gap-2 shadow-gold-glow">
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </Button>
              </Link>
              <Link to="/signup?returnTo=%2Fproducts">
                <Button variant="outline" size="lg" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Create Account</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Forbidden View (e.g. ADMIN only) */}
      {isForbidden && (
        <div className="p-8 sm:p-12 rounded-xl border border-gold/40 bg-surface space-y-4">
          <div className="flex items-center gap-3 text-gold">
            <ShieldAlert className="h-6 w-6" />
            <h3 className="font-serif text-xl font-bold text-foreground">
              Administrator Notice
            </h3>
          </div>
          <p className="text-sm text-muted max-w-xl leading-relaxed">
            Storefront customer endpoints require the USER role. Your account has the ADMIN role.
            You can review and moderate all marketplace products in the Admin Portal.
          </p>
          <div className="pt-2">
            <Link to="/admin/products">
              <Button variant="gold" className="gap-2 shadow-gold-glow">
                <span>Go to Product Moderation</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Authenticated View */}
      {!isGuest && !isForbidden && (
        <div className="space-y-8">
          {/* Filter and Search Bar */}
          <ProductFilters totalResults={filteredProducts.length} />

          {/* Product Grid Area */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3 rounded-lg border border-border p-4 bg-surface">
                  <Skeleton className="aspect-square w-full rounded-md" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex justify-between pt-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-20 rounded-lg border border-border bg-surface p-8 space-y-4">
              <p className="text-sm text-destructive font-medium">
                Unable to connect to product catalog service.
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry Connection</span>
              </Button>
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="text-center py-20 rounded-lg border border-border bg-surface p-8 space-y-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-surface-secondary flex items-center justify-center text-muted">
                <PackageX className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-lg font-medium text-foreground">
                No products match your filters
              </h3>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Try adjusting your search query, price range, or discount criteria to discover more products.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </Button>

                  <span className="text-xs text-muted px-2">
                    Page <strong className="text-foreground">{currentPage}</strong> of{' '}
                    <strong className="text-foreground">{totalPages}</strong>
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
