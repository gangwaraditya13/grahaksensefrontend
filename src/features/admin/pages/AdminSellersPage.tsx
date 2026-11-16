import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/adminApi';
import { formatDate } from '@/shared/lib/utils';
import { Badge } from '@/shared/components/ui/Badge';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { Store, Search, Building2, Phone, MapPin } from 'lucide-react';

export const AdminSellersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: sellers = [], isLoading } = useQuery({
    queryKey: ['admin-sellers'],
    queryFn: () => adminApi.getAllSellers(),
  });

  const filteredSellers = useMemo(() => {
    if (!searchTerm.trim()) return sellers;
    const q = searchTerm.toLowerCase();
    return sellers.filter(
      (s) =>
        s.companyName?.toLowerCase().includes(q) ||
        s.businessAddress?.toLowerCase().includes(q) ||
        s.businessPhone?.toLowerCase().includes(q)
    );
  }, [sellers, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            Seller Directory
          </h1>
          <p className="text-xs text-muted mt-1">
            Registered merchant enterprises, verified business contacts, and compliance.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search company or phone..."
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
      ) : filteredSellers.length === 0 ? (
        <div className="p-12 text-center text-xs text-muted border border-border rounded-lg bg-surface space-y-2">
          <Store className="h-8 w-8 text-gold/40 mx-auto mb-2" />
          <p className="font-serif text-sm font-semibold text-foreground">
            No Sellers Found
          </p>
          <p>No seller records matched your query.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-secondary text-muted uppercase tracking-wider text-[10px] border-b border-border">
                <tr>
                  <th className="px-4 py-3">Company / Brand</th>
                  <th className="px-4 py-3">Business Address</th>
                  <th className="px-4 py-3">Contact Phone</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Onboarded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredSellers.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-secondary/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-gold shrink-0" />
                        <span>{s.companyName}</span>
                      </div>
                      <div className="text-[10px] text-muted">
                        Seller ID #{s.id} • User ID #{s.userId}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted max-w-xs truncate">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-muted shrink-0" />
                        <span>{s.businessAddress || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-foreground">
                        <Phone className="h-3.5 w-3.5 text-gold shrink-0" />
                        <span>{s.businessPhone || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={s.status ? 'success' : 'gold'}>
                        {s.status ? 'Verified' : 'Pending Review'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {s.createdAt ? formatDate(s.createdAt) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
