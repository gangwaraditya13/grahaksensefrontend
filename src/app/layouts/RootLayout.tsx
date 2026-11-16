import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useCartStore } from '@/features/cart/store/cartStore';
import { RoleGate } from '@/app/guards/RoleGate';
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle';
import { ColdStartBanner } from '@/shared/components/feedback/ColdStartBanner';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import {
  ShoppingBag,
  ShoppingCart,
  User,
  LogOut,
  Store,
  ShieldCheck,
} from 'lucide-react';

export const RootLayout: React.FC = () => {
  const { isAuthenticated, user, roles, logout } = useAuthStore();
  const totalCartItems = useCartStore((state) => state.getTotalCount());
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <ColdStartBanner />

      {/* Primary Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="h-9 w-9 rounded-md bg-gold/15 border border-gold/40 flex items-center justify-center text-gold group-hover:scale-105 transition-transform">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <span className="font-serif text-lg font-bold tracking-tight text-foreground group-hover:text-gold transition-colors">
                Grahak<span className="text-gold">Sense</span>
              </span>
              <p className="text-[10px] uppercase tracking-widest text-muted hidden sm:block">
                Beyond Data, Toward Decisions
              </p>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              to="/products"
              className="text-muted hover:text-gold transition-colors"
            >
              Discover
            </Link>

            {/* Seller Studio Link (Only visible if user has SELLER role) */}
            <RoleGate role="SELLER">
              <Link
                to="/seller"
                className="flex items-center gap-1.5 text-muted hover:text-gold transition-colors"
              >
                <Store className="h-4 w-4 text-gold" />
                <span>Seller Studio</span>
              </Link>
            </RoleGate>

            {/* Admin Management Link (Only visible if user has ADMIN role) */}
            <RoleGate role="ADMIN">
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-muted hover:text-gold transition-colors"
              >
                <ShieldCheck className="h-4 w-4 text-gold" />
                <span>Admin</span>
              </Link>
            </RoleGate>
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Shopping Cart Icon with Live Count */}
            <Link to="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-foreground hover:text-gold"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-gold text-black text-[10px] font-bold flex items-center justify-center animate-in zoom-in-50">
                    {totalCartItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Auth Session State */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-border">
                <Link to="/account" className="flex items-center gap-2 group">
                  <div className="h-8 w-8 rounded-full bg-surface-secondary border border-border flex items-center justify-center text-muted group-hover:border-gold transition-colors">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="hidden lg:block text-left text-xs">
                    <p className="font-medium text-foreground group-hover:text-gold transition-colors">
                      {user.name || user.userName}
                    </p>
                    <div className="flex items-center gap-1">
                      {roles.map((r) => (
                        <Badge
                          key={r}
                          variant={r === 'ADMIN' ? 'gold' : r === 'SELLER' ? 'success' : 'secondary'}
                          className="text-[9px] py-0 px-1"
                        >
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Link>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title="Sign Out"
                  aria-label="Sign Out"
                  className="text-muted hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Premium Footer */}
      <footer className="border-t border-border bg-surface py-12 mt-16 text-muted text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded bg-gold/15 border border-gold/40 flex items-center justify-center text-gold">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <span className="font-serif text-base font-bold text-foreground">
                Grahak<span className="text-gold">Sense</span>
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Beyond Data, Toward Decisions. A modern enterprise commerce ecosystem
              unifying customer discovery, seller operations, and real-time intelligence.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
              Storefront
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/products" className="hover:text-gold transition-colors">
                  Catalog & Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-gold transition-colors">
                  Cart & Bags
                </Link>
              </li>
              <li>
                <Link to="/products?discount=true" className="hover:text-gold transition-colors">
                  Special Offers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
              Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/seller" className="hover:text-gold transition-colors">
                  Seller Studio
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-gold transition-colors">
                  Admin Management
                </Link>
              </li>
              <li>
                <Link to="/admin/insights" className="hover:text-gold transition-colors">
                  Intelligence Dashboard
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-gold transition-colors">
                  Customer Profile
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
              Platform
            </h4>
            <p className="text-xs text-muted mb-2">
              Designed with Obsidian and Gold aesthetics. Currency in INR (₹).
            </p>
            <p className="text-[11px] text-muted/80">
              © {new Date().getFullYear()} GrahakSense Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
