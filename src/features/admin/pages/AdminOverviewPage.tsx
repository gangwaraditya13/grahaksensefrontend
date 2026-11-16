import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/adminApi';
import { formatDate } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import {
  Users,
  Store,
  Layers,
  Activity,
  ArrowRight,
  LineChart,
} from 'lucide-react';

export const AdminOverviewPage: React.FC = () => {
  const { data: users = [], isLoading: isUsersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getAllUsers(),
  });

  const { data: sellers = [], isLoading: isSellersLoading } = useQuery({
    queryKey: ['admin-sellers'],
    queryFn: () => adminApi.getAllSellers(),
  });

  const { data: products = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => adminApi.getAllProducts(),
  });

  const { data: activities = [], isLoading: isActivitiesLoading } = useQuery({
    queryKey: ['admin-activities'],
    queryFn: () => adminApi.getAllActivities(),
  });

  const recentActivities = [...activities].reverse().slice(0, 8);

  return (
    <div className="space-y-8">
      {/* Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
              Marketplace Governance
            </h1>
            <Badge variant="gold">ADMIN ONLY</Badge>
          </div>
          <p className="text-xs text-muted mt-1">
            Global system monitoring, merchant compliance, and platform decision analytics.
          </p>
        </div>

        <Link to="/admin/insights">
          <Button variant="gold" className="gap-2 shadow-gold-glow">
            <LineChart className="h-4 w-4" />
            <span>Launch Intelligence Dashboard</span>
          </Button>
        </Link>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-lg border border-border bg-surface flex items-center gap-4">
          <div className="h-12 w-12 rounded-md bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-muted uppercase tracking-wider">Registered Users</span>
            <p className="font-serif text-2xl font-bold text-foreground mt-0.5">
              {isUsersLoading ? '...' : users.length}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-lg border border-border bg-surface flex items-center gap-4">
          <div className="h-12 w-12 rounded-md bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-muted uppercase tracking-wider">Active Sellers</span>
            <p className="font-serif text-2xl font-bold text-foreground mt-0.5">
              {isSellersLoading ? '...' : sellers.length}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-lg border border-border bg-surface flex items-center gap-4">
          <div className="h-12 w-12 rounded-md bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-muted uppercase tracking-wider">Catalog Products</span>
            <p className="font-serif text-2xl font-bold text-foreground mt-0.5">
              {isProductsLoading ? '...' : products.length}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-lg border border-border bg-surface flex items-center gap-4">
          <div className="h-12 w-12 rounded-md bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-muted uppercase tracking-wider">Total Events</span>
            <p className="font-serif text-2xl font-bold text-foreground mt-0.5">
              {isActivitiesLoading ? '...' : activities.length}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Access Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link
          to="/admin/users"
          className="p-5 rounded-lg border border-border bg-surface hover:border-gold/60 transition-all group"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-semibold text-foreground group-hover:text-gold transition-colors">
              User Directory
            </h3>
            <ArrowRight className="h-4 w-4 text-muted group-hover:text-gold group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-xs text-muted mt-2">
            Inspect all consumer and merchant accounts, contact info, and permission roles.
          </p>
        </Link>

        <Link
          to="/admin/sellers"
          className="p-5 rounded-lg border border-border bg-surface hover:border-gold/60 transition-all group"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-semibold text-foreground group-hover:text-gold transition-colors">
              Seller Directory
            </h3>
            <ArrowRight className="h-4 w-4 text-muted group-hover:text-gold group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-xs text-muted mt-2">
            Review merchant companies, registered office addresses, and verification statuses.
          </p>
        </Link>

        <Link
          to="/admin/products"
          className="p-5 rounded-lg border border-border bg-surface hover:border-gold/60 transition-all group"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-semibold text-foreground group-hover:text-gold transition-colors">
              Product Moderation
            </h3>
            <ArrowRight className="h-4 w-4 text-muted group-hover:text-gold group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-xs text-muted mt-2">
            Audit catalog listings across all sellers and enforce platform moderation policies.
          </p>
        </Link>
      </div>

      {/* Live Activity Telemetry Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-gold" />
            <span>Real-Time Customer Activity Log</span>
          </h2>
          <Link
            to="/admin/insights"
            className="text-xs text-gold hover:underline flex items-center gap-1"
          >
            <span>Full Analytics & Funnels</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isActivitiesLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        ) : recentActivities.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted border border-border rounded-lg bg-surface">
            No activity events recorded yet. Events will appear as users interact with the storefront.
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-surface overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-secondary text-muted uppercase tracking-wider text-[10px] border-b border-border">
                <tr>
                  <th className="px-4 py-3">Event Type</th>
                  <th className="px-4 py-3">User ID</th>
                  <th className="px-4 py-3">Product ID</th>
                  <th className="px-4 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {recentActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-surface-secondary/40 transition-colors">
                    <td className="px-4 py-3">
                      <Badge variant="gold" className="text-[10px]">
                        {act.event}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">User #{act.userId}</td>
                    <td className="px-4 py-3 text-muted">
                      {act.productId ? `Product #${act.productId}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {act.createdAt ? formatDate(act.createdAt) : 'Just now'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
