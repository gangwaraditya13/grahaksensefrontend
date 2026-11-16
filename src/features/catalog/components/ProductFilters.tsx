import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Search, RotateCcw, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { activityTracker } from '@/shared/lib/activityTracker';

interface ProductFiltersProps {
  maxPriceBound?: number;
  totalResults: number;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  totalResults,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State initialized from URL query params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [discountOnly, setDiscountOnly] = useState(
    searchParams.get('discount') === 'true'
  );
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'default');

  // Debounced search (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (searchTerm.trim()) {
            next.set('q', searchTerm.trim());
          } else {
            next.delete('q');
          }
          return next;
        },
        { replace: true }
      );

      if (searchTerm.trim()) {
        activityTracker.searchProduct(searchTerm.trim());
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, setSearchParams]);

  const applyPriceFilter = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (minPrice) next.set('minPrice', minPrice);
        else next.delete('minPrice');

        if (maxPrice) next.set('maxPrice', maxPrice);
        else next.delete('maxPrice');
        return next;
      },
      { replace: true }
    );
  };

  const handleToggleDiscount = () => {
    const nextVal = !discountOnly;
    setDiscountOnly(nextVal);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (nextVal) next.set('discount', 'true');
        else next.delete('discount');
        return next;
      },
      { replace: true }
    );
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (newSort && newSort !== 'default') next.set('sort', newSort);
        else next.delete('sort');
        return next;
      },
      { replace: true }
    );
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setDiscountOnly(false);
    setSortBy('default');
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters = Boolean(
    searchTerm || minPrice || maxPrice || discountOnly || sortBy !== 'default'
  );

  return (
    <div className="space-y-6 p-5 rounded-lg border border-border bg-surface">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* 300ms Debounced Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by name or keywords..."
            className="w-full h-10 pl-9 pr-4 rounded-md border border-border bg-surface-secondary text-sm text-foreground placeholder:text-muted/70 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-colors"
          />
        </div>

        {/* Sort & Reset Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="h-10 px-3 rounded-md border border-border bg-surface text-xs font-medium text-foreground focus:border-gold focus:outline-none"
            >
              <option value="default">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest Releases</option>
            </select>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs text-muted hover:text-foreground gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter Row: Price Range & Discount Toggles */}
      <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border/60">
        <div className="flex items-center gap-2 text-xs text-muted font-medium">
          <SlidersHorizontal className="h-3.5 w-3.5 text-gold" />
          <span>Filters:</span>
        </div>

        {/* Price Inputs in INR */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min ₹"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={applyPriceFilter}
            onKeyDown={(e) => e.key === 'Enter' && applyPriceFilter()}
            className="w-24 h-8 px-2.5 rounded border border-border bg-surface-secondary text-xs text-foreground placeholder:text-muted/60 focus:border-gold focus:outline-none"
          />
          <span className="text-muted text-xs">—</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={applyPriceFilter}
            onKeyDown={(e) => e.key === 'Enter' && applyPriceFilter()}
            className="w-24 h-8 px-2.5 rounded border border-border bg-surface-secondary text-xs text-foreground placeholder:text-muted/60 focus:border-gold focus:outline-none"
          />
        </div>

        {/* Discount Filter Badge Button */}
        <button
          onClick={handleToggleDiscount}
          className="focus:outline-none active:scale-95 transition-transform"
        >
          <Badge
            variant={discountOnly ? 'discount' : 'outline'}
            className="cursor-pointer py-1 px-2.5 text-xs font-medium"
          >
            {discountOnly ? '✓ Special Discounts' : 'Special Discounts'}
          </Badge>
        </button>

        {/* Results Count */}
        <div className="ml-auto text-xs text-muted">
          Showing <strong className="text-foreground">{totalResults}</strong> products
        </div>
      </div>
    </div>
  );
};
