import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { RequireRole } from '@/app/guards/RequireRole';
import {
  ShieldAlert,
  Users,
  Store,
  Layers,
  LineChart,
  LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export const AdminLayout: React.FC = () => {
  const navItems = [
    { label: 'Admin Overview', to: '/admin', icon: LayoutDashboard, end: true },
    { label: 'User Directory', to: '/admin/users', icon: Users },
    { label: 'Seller Directory', to: '/admin/sellers', icon: Store },
    { label: 'Product Moderation', to: '/admin/products', icon: Layers },
    {
      label: 'Intelligence Dashboard',
      to: '/admin/insights',
      icon: LineChart,
      highlight: true,
    },
  ];

  return (
    <RequireRole role="ADMIN">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Admin Sidebar Navigation */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="p-4 rounded-lg border border-border bg-surface mb-6">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
                <div className="h-10 w-10 rounded-md bg-gold/15 border border-gold/40 flex items-center justify-center text-gold">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-foreground text-sm">
                    Admin Portal
                  </h2>
                  <p className="text-[11px] text-muted">Governance & Analytics</p>
                </div>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors',
                          isActive
                            ? 'bg-gold/15 text-gold border border-gold/30 font-semibold'
                            : 'text-muted hover:text-foreground hover:bg-surface-secondary',
                          item.highlight && !isActive && 'text-gold/80'
                        )
                      }
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Admin Workspace Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </RequireRole>
  );
};
