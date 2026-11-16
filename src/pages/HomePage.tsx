import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLandingProducts } from '@/features/catalog/hooks/useProducts';
import { ProductCard } from '@/features/catalog/components/ProductCard';
import { activityTracker } from '@/shared/lib/activityTracker';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Card, CardContent } from '@/shared/components/ui/Card';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import {
  Sparkles,
  ArrowRight,
  Percent,
  Award,
  ChevronRight,
  ShieldCheck,
  Truck,
  Lock,
  LogIn,
  UserPlus,
  RefreshCw,
  ShieldAlert,
  Package,
} from 'lucide-react';
import { calculateEffectivePrice } from '@/shared/lib/utils';

export const HomePage: React.FC = () => {
  const {
    products,
    isGuest,
    isForbidden,
    isLoading,
    isSuccess,
    isEmpty,
    isError,
    refetch,
  } = useLandingProducts();

  // Curate products from real backend data when authenticated
  const discountedProducts = products
    .filter((p) => {
      const { effectiveDiscountPercent } = calculateEffectivePrice(
        p.price,
        p.discount,
        p.adminDiscount
      );
      return effectiveDiscountPercent > 0;
    })
    .slice(0, 4);

  const latestProducts = [...products]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 4);

  const featuredProducts = products.slice(0, 4);

  // Telemetry: Log VIEW_RECOMMENDATION when curated picks are available
  useEffect(() => {
    if (featuredProducts.length > 0) {
      activityTracker.viewRecommendation(featuredProducts[0].id);
    }
  }, [featuredProducts.length]);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Banner Section (Accessible to all) */}
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32 border-b border-border/60 bg-gradient-to-b from-gold/5 via-transparent to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2">
              <Badge variant="gold" className="px-3 py-1 text-xs">
                <Sparkles className="h-3.5 w-3.5 mr-1.5 text-gold" />
                Beyond Data, Toward Decisions
              </Badge>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              Elevate Your World With <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber-300 to-amber-500">
                Curated Craftsmanship.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted max-w-2xl leading-relaxed">
              Explore authentic luxury products directly from registered merchants.
              Transparent pricing in INR, guaranteed delivery, and intuitive intelligence.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/products">
                <Button size="lg" variant="gold" className="gap-2 shadow-gold-glow">
                  <span>Explore Collection</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline" className="gap-2">
                  <span>Join GrahakSense</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Discovery Bar (Accessible to all) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-border pb-3 mb-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold">
            Artisan Collections
          </span>
          <span className="text-xs text-muted">Shop by Craft</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[
            { label: 'Artisanal Textiles', slug: 'textiles' },
            { label: 'Fine Jewelry & Gems', slug: 'jewelry' },
            { label: 'Heritage Decor', slug: 'decor' },
            { label: 'Artisanal Footwear', slug: 'footwear' },
            { label: 'Bespoke Accessories', slug: 'accessories' },
          ].map((cat) => (
            <Link
              key={cat.slug}
              to={`/products?category=${cat.slug}`}
              onClick={() => activityTracker.viewCategory()}
              className="p-3.5 rounded-lg border border-border bg-surface hover:border-gold/60 hover:bg-gold/[0.03] transition-all text-center group"
            >
              <p className="text-xs font-medium text-foreground group-hover:text-gold transition-colors">
                {cat.label}
              </p>
              <p className="text-[10px] text-muted mt-0.5">Explore &rarr;</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Product Section / State Engine */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* State A: Guest Visitor — Attractive Sign-in Call to Action */}
        {isGuest && (
          <div className="relative rounded-2xl border border-gold/40 bg-gradient-to-br from-surface via-surface-secondary to-surface p-8 sm:p-12 overflow-hidden shadow-gold-glow">
            <div className="relative z-10 max-w-2xl space-y-5">
              <div className="inline-flex items-center gap-2">
                <div className="h-9 w-9 rounded-md bg-gold/15 border border-gold/40 flex items-center justify-center text-gold">
                  <Lock className="h-4 w-4" />
                </div>
                <Badge variant="gold">Member Catalog Access</Badge>
              </div>

              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-foreground">
                Sign in to Discover Curated Luxury
              </h2>

              <p className="text-sm text-muted leading-relaxed">
                Our verified artisan marketplace and direct merchant pricing in INR (₹) are
                reserved for registered customers. Sign in with your account or create one now to
                browse the complete catalog, inspect high-resolution photography, and build your bag.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to="/login">
                  <Button variant="gold" size="lg" className="gap-2 shadow-gold-glow">
                    <LogIn className="h-4 w-4" />
                    <span>Sign In to Browse</span>
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="outline" size="lg" className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    <span>Create Account</span>
                  </Button>
                </Link>
              </div>

              {/* Assurances Pill List */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/60 text-xs text-muted">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-gold shrink-0" />
                  <span>Verified Merchant Listings</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-gold shrink-0" />
                  <span>Insured Express Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-gold shrink-0" />
                  <span>Direct Artisan Pricing</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* State B: Forbidden (e.g. Account has ADMIN role without customer USER role) */}
        {isForbidden && (
          <div className="p-8 sm:p-12 rounded-xl border border-gold/40 bg-surface space-y-4">
            <div className="flex items-center gap-3 text-gold">
              <ShieldAlert className="h-6 w-6" />
              <h3 className="font-serif text-xl font-bold text-foreground">
                Role Permission Notice
              </h3>
            </div>
            <p className="text-sm text-muted max-w-xl leading-relaxed">
              Storefront shopping and customer product APIs require the <strong>USER</strong> role.
              Your authenticated session possesses administrator privileges. You can oversee
              the catalog and view telemetry via the Admin Portal.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/admin">
                <Button variant="gold" className="gap-2 shadow-gold-glow">
                  <span>Open Admin Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/admin/insights">
                <Button variant="outline">
                  <span>Intelligence Dashboard</span>
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* State C: Authenticated Loading (or restoring session) */}
        {isLoading && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-8 w-64" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 rounded-lg border border-border bg-surface space-y-3">
                  <Skeleton className="aspect-square w-full rounded-md" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* State D: Authenticated Error */}
        {isError && (
          <div className="p-8 text-center rounded-xl border border-destructive/40 bg-surface space-y-4">
            <p className="text-sm text-destructive font-medium">
              Unable to load catalog products at this moment.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry Product Connection</span>
            </Button>
          </div>
        )}

        {/* State E: Authenticated Empty */}
        {isEmpty && (
          <div className="p-12 text-center rounded-xl border border-dashed border-border bg-surface space-y-3">
            <Package className="h-10 w-10 text-gold/40 mx-auto" />
            <h3 className="font-serif text-lg font-semibold text-foreground">
              No Products Published Yet
            </h3>
            <p className="text-xs text-muted max-w-md mx-auto">
              Our registered sellers are preparing new artisan pieces. Please check back shortly.
            </p>
          </div>
        )}

        {/* State F: Authenticated Success — Render Real Backend Products */}
        {isSuccess && !isEmpty && (
          <div className="space-y-16">
            {/* Featured Products */}
            {featuredProducts.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-end justify-between border-b border-border pb-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-gold">
                      Curated Picks
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                      Featured Products
                    </h2>
                  </div>
                  <Link
                    to="/products"
                    className="text-xs font-medium text-gold hover:underline flex items-center gap-1"
                  >
                    <span>View All ({products.length})</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {featuredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} isRecommendation={true} />
                  ))}
                </div>
              </div>
            )}

            {/* Special Discounts */}
            {discountedProducts.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-end justify-between border-b border-border pb-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-red-400">
                      Limited Time Deals
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                      Special Offers & Discounts
                    </h2>
                  </div>
                  <Link
                    to="/products?discount=true"
                    className="text-xs font-medium text-gold hover:underline flex items-center gap-1"
                  >
                    <span>View Offers</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {discountedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* Latest Arrivals */}
            {latestProducts.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-end justify-between border-b border-border pb-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-gold">
                      Fresh From Workshop
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                      Latest Arrivals
                    </h2>
                  </div>
                  <Link
                    to="/products?sort=newest"
                    className="text-xs font-medium text-gold hover:underline flex items-center gap-1"
                  >
                    <span>See Newest</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {latestProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Promotional Banner (Visible to all) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl border border-gold/40 bg-gradient-to-r from-surface via-surface-secondary to-surface p-8 sm:p-12 overflow-hidden shadow-gold-glow">
          <div className="relative z-10 max-w-xl space-y-4">
            <Badge variant="gold">Merchant Platform</Badge>
            <h3 className="font-serif text-2xl sm:text-4xl font-bold text-foreground">
              Are you a brand or artisan?
            </h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Join GrahakSense as an authorized seller. Benefit from seamless S3 asset
              uploads, direct customer access, and intelligent activity-driven insights.
            </p>
            <Link to="/account">
              <Button variant="primary" className="mt-2 gap-2">
                <span>Become a Seller</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Value Pillars (Visible to all) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border">
            <CardContent className="p-6 space-y-2 text-center sm:text-left">
              <Truck className="h-6 w-6 text-gold mb-2" />
              <h4 className="font-serif font-bold text-base text-foreground">
                All-India Delivery
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                Insured express delivery with live transit notifications and tracking.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6 space-y-2 text-center sm:text-left">
              <ShieldCheck className="h-6 w-6 text-gold mb-2" />
              <h4 className="font-serif font-bold text-base text-foreground">
                Verified Merchants
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                Every merchant is vetted to ensure guaranteed quality and authentic products.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6 space-y-2 text-center sm:text-left">
              <Award className="h-6 w-6 text-gold mb-2" />
              <h4 className="font-serif font-bold text-base text-foreground">
                Direct Pricing
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                Transparent manufacturer pricing in INR with no hidden platform markups.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};
