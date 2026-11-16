import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { formatINR } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Sparkles,
  Info,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { activityTracker } from '@/shared/lib/activityTracker';

export const CartPage: React.FC = () => {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    getTotalDiscount,
    getFinalTotal,
  } = useCartStore();

  const [showCheckoutNotice, setShowCheckoutNotice] = useState(false);

  const subtotal = getSubtotal();
  const totalDiscount = getTotalDiscount();
  const finalTotal = getFinalTotal();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="mx-auto h-20 w-20 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shadow-gold-glow">
          <ShoppingBag className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Your Shopping Bag is Empty
          </h1>
          <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
            Discover bespoke luxury items handcrafted by verified artisans and registered merchants.
          </p>
        </div>

        <div className="pt-4">
          <Link to="/products">
            <Button size="lg" variant="gold" className="gap-2 shadow-gold-glow">
              <span>Explore Products</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            Shopping Bag
          </h1>
          <p className="text-xs text-muted mt-1">
            Review your selected products and proceed to order fulfillment.
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={clearCart}
          className="text-xs text-muted hover:text-destructive"
        >
          Clear Bag
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Cart Items Table/List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const product = item.product;
            const originalUnitPrice = product?.price || item.priceSnapshot;
            const finalUnitPrice = item.priceSnapshot;
            const itemTotal = finalUnitPrice * item.quantity;
            const imageUrl =
              product?.imageUrls && product.imageUrls.length > 0
                ? product.imageUrls[0]
                : null;

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg border border-border bg-surface transition-all hover:border-gold/40"
              >
                {/* Product Image & Info */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="h-20 w-20 rounded-md overflow-hidden bg-surface-secondary border border-border shrink-0">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product?.productName || 'Product'}
                        className="h-full w-full object-cover object-center"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted/50 text-[10px]">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <Link
                      to={`/products/${item.productId}`}
                      className="font-serif text-sm font-semibold text-foreground hover:text-gold transition-colors line-clamp-1"
                    >
                      {product?.productName || `Product #${item.productId}`}
                    </Link>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-medium text-foreground">
                        {formatINR(finalUnitPrice)}
                      </span>
                      {originalUnitPrice > finalUnitPrice && (
                        <span className="text-muted line-through text-[11px]">
                          {formatINR(originalUnitPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantity Controls & Total */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                  <div className="flex items-center border border-border rounded-md bg-surface-secondary">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 text-muted hover:text-foreground transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-semibold text-foreground">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 text-muted hover:text-foreground transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="text-right min-w-[80px]">
                    <span className="font-serif font-bold text-sm text-foreground">
                      {formatINR(itemTotal)}
                    </span>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-muted hover:text-destructive transition-colors p-1"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="pt-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-xs text-muted hover:text-gold transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="space-y-6">
          <Card className="border-border/80 shadow-gold-glow">
            <CardHeader className="pb-4 border-b border-border">
              <CardTitle className="text-base font-serif">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 text-xs">
              <div className="flex justify-between text-muted">
                <span>Subtotal (Catalog Value)</span>
                <span className="text-foreground font-medium">{formatINR(subtotal)}</span>
              </div>

              {totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Merchant & Platform Savings</span>
                  <span>- {formatINR(totalDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-muted">
                <span className="flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-gold" />
                  <span>Insured Delivery</span>
                </span>
                <span className="text-emerald-400 font-medium uppercase tracking-wider text-[11px]">
                  FREE
                </span>
              </div>

              <div className="pt-3 border-t border-border flex justify-between items-baseline">
                <span className="font-serif text-base font-bold text-foreground">Total</span>
                <div className="text-right">
                  <span className="font-serif text-2xl font-bold text-foreground">
                    {formatINR(finalTotal)}
                  </span>
                  <p className="text-[10px] text-muted">Inclusive of all taxes</p>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                variant="gold"
                size="lg"
                onClick={() => {
                  activityTracker.beginCheckout();
                  setShowCheckoutNotice(true);
                }}
                className="w-full mt-4 gap-2 font-semibold shadow-gold-glow"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Button>

              {/* Checkout Notice Modal / Inline Callout */}
              {showCheckoutNotice && (
                <div className="p-4 rounded-lg bg-gold/10 border border-gold/40 text-foreground space-y-3 mt-3 animate-in fade-in-50">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gold text-xs">Simulated Checkout</p>
                      <p className="text-[11px] text-muted leading-relaxed mt-1">
                        Order confirmation and live telemetry. Confirm this purchase to complete
                        the checkout journey or cancel to return to bag.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={async () => {
                        const firstProductId = items[0]?.productId;
                        await activityTracker.purchase(firstProductId);
                        clearCart();
                        setShowCheckoutNotice(false);
                        toast.success('Order Placed Successfully', {
                          description: 'Your purchase has been recorded and order created.',
                        });
                      }}
                      className="flex-1 text-xs gap-1 shadow-gold-glow"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Confirm Order</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        const firstProductId = items[0]?.productId;
                        await activityTracker.cancelPurchase(firstProductId);
                        setShowCheckoutNotice(false);
                      }}
                      className="text-xs text-muted hover:text-foreground"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assurances */}
          <div className="p-4 rounded-lg border border-border bg-surface space-y-3 text-xs text-muted">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-gold shrink-0" />
              <span>Direct fulfillment from certified marketplace sellers.</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold shrink-0" />
              <span>Complimentary bespoke packaging with each order.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
