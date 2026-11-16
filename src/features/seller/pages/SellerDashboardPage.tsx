import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerApi } from '../api/sellerApi';
import { useAuthStore } from '@/features/auth/store/authStore';
import { formatINR, formatDate } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Store,
  Layers,
  Coins,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export const SellerDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);

  // Fetch seller profile to get sellerId
  const { data: sellerProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['seller-profile', user?.id],
    queryFn: () => (user?.id ? sellerApi.getSellerProfile(user.id) : null),
    enabled: Boolean(user?.id),
  });

  const sellerId = sellerProfile?.id || user?.id || 1;

  // Fetch seller's products
  const {
    data: products = [],
    isLoading: isProductsLoading,
  } = useQuery({
    queryKey: ['seller-products', sellerId],
    queryFn: () => sellerApi.getSellerProducts(sellerId),
    enabled: Boolean(sellerId),
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: (productId: number) => sellerApi.deleteProduct(productId),
    onSuccess: () => {
      toast.success('Product Deleted', {
        description: 'The product listing has been permanently removed.',
      });
      queryClient.invalidateQueries({ queryKey: ['seller-products', sellerId] });
      setDeletingProductId(null);
    },
  });

  // Filter products by search query
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const q = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.productName.toLowerCase().includes(q) ||
        p.productDescription?.toLowerCase().includes(q)
    );
  }, [products, searchTerm]);

  // Catalog metrics
  const totalProducts = products.length;
  const totalCatalogValue = products.reduce((acc, p) => acc + p.price, 0);
  const avgPrice = totalProducts > 0 ? totalCatalogValue / totalProducts : 0;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
              {sellerProfile?.companyName || 'Seller Studio'}
            </h1>
            <Badge variant="gold">Verified Merchant</Badge>
          </div>
          <p className="text-xs text-muted mt-1">
            Manage your live inventory, price adjustments, and catalog assets.
          </p>
        </div>

        <Link to="/seller/products/new">
          <Button variant="gold" className="gap-2 shadow-gold-glow">
            <Plus className="h-4 w-4" />
            <span>Add New Product</span>
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 rounded-lg border border-border bg-surface flex items-center gap-4">
          <div className="h-12 w-12 rounded-md bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-muted uppercase tracking-wider">Total Listings</span>
            <p className="font-serif text-2xl font-bold text-foreground mt-0.5">
              {isProductsLoading ? '...' : totalProducts}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-lg border border-border bg-surface flex items-center gap-4">
          <div className="h-12 w-12 rounded-md bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
            <Coins className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-muted uppercase tracking-wider">Catalog Value</span>
            <p className="font-serif text-2xl font-bold text-foreground mt-0.5">
              {isProductsLoading ? '...' : formatINR(totalCatalogValue)}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-lg border border-border bg-surface flex items-center gap-4">
          <div className="h-12 w-12 rounded-md bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-muted uppercase tracking-wider">Average Price</span>
            <p className="font-serif text-2xl font-bold text-foreground mt-0.5">
              {isProductsLoading ? '...' : formatINR(avgPrice)}
            </p>
          </div>
        </div>
      </div>

      {/* Products Search & List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search your products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-md border border-border bg-surface text-xs text-foreground placeholder:text-muted focus:border-gold focus:outline-none"
            />
          </div>

          <span className="text-xs text-muted self-center">
            Showing <strong className="text-foreground">{filteredProducts.length}</strong> of{' '}
            {totalProducts} products
          </span>
        </div>

        {isProductsLoading || isProfileLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 rounded-lg border border-border bg-surface p-8 space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-surface-secondary flex items-center justify-center text-muted">
              <Package className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-lg font-medium text-foreground">
              {searchTerm ? 'No products match your search' : 'No products published yet'}
            </h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              {searchTerm
                ? 'Try a different search term or clear the filter.'
                : 'Publish your first luxury product to start selling on GrahakSense.'}
            </p>
            {!searchTerm && (
              <Link to="/seller/products/new">
                <Button variant="primary" size="sm" className="mt-2 gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Create First Product</span>
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-secondary text-muted uppercase tracking-wider text-[10px] border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Seller Discount</th>
                    <th className="px-4 py-3">Platform Discount</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredProducts.map((p) => {
                    const mainImage =
                      p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls[0] : null;

                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-surface-secondary/40 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded overflow-hidden bg-surface-secondary border border-border shrink-0">
                              {mainImage ? (
                                <img
                                  src={mainImage}
                                  alt={p.productName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-[9px] text-muted">
                                  No Img
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <Link
                                to={`/products/${p.id}`}
                                className="font-medium text-foreground hover:text-gold transition-colors line-clamp-1"
                              >
                                {p.productName}
                              </Link>
                              <span className="text-[10px] text-muted">ID: #{p.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {formatINR(p.price)}
                        </td>
                        <td className="px-4 py-3">
                          {p.discount > 0 ? (
                            <Badge variant="discount">{p.discount}%</Badge>
                          ) : (
                            <span className="text-muted">None</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {p.adminDiscount > 0 ? (
                            <Badge variant="gold">{p.adminDiscount}%</Badge>
                          ) : (
                            <span className="text-muted">None</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {p.createdAt ? formatDate(p.createdAt) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/products/${p.id}`} target="_blank">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-muted hover:text-gold"
                                title="View in Storefront"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </Link>

                            <Link to={`/seller/products/${p.id}/edit`}>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-muted hover:text-gold"
                                title="Edit Product"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                            </Link>

                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeletingProductId(p.id)}
                              className="h-7 w-7 text-muted hover:text-destructive"
                              title="Delete Product"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingProductId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <h3 className="font-serif font-bold text-base">Delete Product Listing?</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Are you sure you want to delete product #{deletingProductId}? This action cannot be
              undone and will remove the item from the storefront.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeletingProductId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                isLoading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deletingProductId)}
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
