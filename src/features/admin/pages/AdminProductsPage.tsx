import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/adminApi';
import { formatINR, formatDate } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import {
  Layers,
  Search,
  Trash2,
  ExternalLink,
  AlertTriangle,
  Store,
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminProductsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => adminApi.getAllProducts(),
  });

  const deleteMutation = useMutation({
    mutationFn: (productId: number) => adminApi.deleteProduct(productId),
    onSuccess: () => {
      toast.success('Product Moderated', {
        description: 'Product listing removed from marketplace.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeletingProductId(null);
    },
  });

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const q = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.productName.toLowerCase().includes(q) ||
        p.productDescription?.toLowerCase().includes(q)
    );
  }, [products, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            Product Moderation
          </h1>
          <p className="text-xs text-muted mt-1">
            Global catalog inspection, pricing verification, and listing enforcement.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search catalog products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-md border border-border bg-surface text-xs text-foreground placeholder:text-muted focus:border-gold focus:outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center text-xs text-muted border border-border rounded-lg bg-surface space-y-2">
          <Layers className="h-8 w-8 text-gold/40 mx-auto mb-2" />
          <p className="font-serif text-sm font-semibold text-foreground">
            No Products Found
          </p>
          <p>No products matched your search criteria.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-secondary text-muted uppercase tracking-wider text-[10px] border-b border-border">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Seller</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Discounts</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredProducts.map((p) => {
                  const mainImage =
                    p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls[0] : null;

                  return (
                    <tr key={p.id} className="hover:bg-surface-secondary/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded overflow-hidden bg-surface-secondary border border-border shrink-0">
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
                          <div>
                            <Link
                              to={`/products/${p.id}`}
                              className="font-medium text-foreground hover:text-gold transition-colors line-clamp-1"
                            >
                              {p.productName}
                            </Link>
                            <span className="text-[10px] text-muted">ID #{p.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        <div className="flex items-center gap-1">
                          <Store className="h-3.5 w-3.5 text-gold shrink-0" />
                          <span>Seller #{p.sellerId}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {formatINR(p.price)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {p.discount > 0 && (
                            <Badge variant="discount">{p.discount}%</Badge>
                          )}
                          {p.adminDiscount > 0 && (
                            <Badge variant="gold">{p.adminDiscount}% Admin</Badge>
                          )}
                          {!p.discount && !p.adminDiscount && (
                            <span className="text-muted">None</span>
                          )}
                        </div>
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
                              title="Inspect Product"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </Link>

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeletingProductId(p.id)}
                            className="h-7 w-7 text-muted hover:text-destructive"
                            title="Remove Product"
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

      {/* Confirmation Modal */}
      {deletingProductId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-serif font-bold text-base">Moderate Product</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Are you sure you want to moderate and remove product #{deletingProductId}? This
              will immediately unpublish the product from all storefront queries.
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
                Remove Product
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
