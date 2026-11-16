# GrahakSense — Production E-Commerce Platform

> **Beyond Data, Toward Decisions.**

A modern, production-grade e-commerce application engineered with React 18, TypeScript, Tailwind CSS, TanStack Query, and Zustand. GrahakSense unifies a luxury customer shopping experience, merchant Seller Studio with direct AWS S3 uploads, and an ADMIN-only Intelligence Dashboard with real-time conversion and RFM telemetry.

---

## 1. Architectural Highlights

- **Storefront-First Philosophy:** A high-converting consumer shopping experience with authentic backend product catalogs (`/public/all`), 300ms debounced search, price range filtering in INR (`₹`), and dynamic URL query synchronization.
- **Three Clear Roles:**
  - **`USER`:** Browse, search, view product details, manage cart, update profile, apply to become a seller.
  - **`SELLER`:** Merchant Studio access, catalog management (`/product/seller/{sellerId}`), product creation/editing, and direct S3 pre-signed asset uploads (max 2 MB, JPG/PNG/WEBP, 2 concurrent uploads).
  - **`ADMIN`:** Marketplace governance, user directory (`/user/all/users`), seller directory (`/seller/all`), product moderation (`DELETE /product/{productId}`), and the Recharts **Intelligence Dashboard** (`/activity/activities`).
  - *Note on ANALYST Role:* Per project specifications, the backend schema mentions `ANALYST`, but it is strictly omitted from the frontend. Intelligence access is strictly restricted to `ADMIN`.
- **Obsidian & Gold Design System:** Handcrafted typography pairing **Fraunces** for headings and **Inter** for UI, with seamless Dark and Light theme switching and INR currency formatting (`Intl.NumberFormat('en-IN')`).
- **Resilient Network Layer:** In-memory JWT access token management, silent automatic refresh queue on 401s, Render cold-start detection banner (>6s), and dedicated S3 PUT upload handler without leaked `Authorization` headers.

---

## 2. Technology Stack

- **Framework:** React 18 & Vite 5
- **Language:** TypeScript 5 (Strict Mode)
- **Styling:** Tailwind CSS with CSS Variable design tokens
- **Routing:** React Router v6
- **Server State:** TanStack React Query v5 (bounded retry strategy)
- **Client State:** Zustand v5 (in-memory auth session, guest cart persistence)
- **HTTP Client:** Axios v1.7 with interceptors
- **Form Management:** React Hook Form & Zod
- **Visualizations:** Recharts v2 (Conversion funnels, activity timelines, RFM frequency cohorts)
- **UI Components & Icons:** Radix UI primitives, Lucide React, Sonner toasts
- **Testing:** Vitest, React Testing Library, JSDOM, Playwright

---

## 3. Directory Structure

```
grahaksense/
├── src/
│   ├── app/
│   │   ├── guards/          # RequireAuth, RequireRole, RoleGate
│   │   ├── layouts/         # RootLayout, SellerLayout, AdminLayout
│   │   ├── providers/       # TanStack Query & Toast providers
│   │   └── router/          # Complete React Router v6 definitions
│   ├── features/
│   │   ├── account/         # User profile views and update operations
│   │   ├── admin/           # Admin directory, moderation, and Intelligence Dashboard
│   │   ├── auth/            # Sign in, Sign up, OTP reset, session store
│   │   ├── cart/            # Shopping bag, calculations, server synchronization
│   │   ├── catalog/         # Products discovery, gallery, filters, activity tracking
│   │   └── seller/          # Seller Studio, S3 upload pipeline, inventory CRUD
│   ├── shared/
│   │   ├── api/             # Axios client, cold start detector, error handler
│   │   ├── components/      # Button, Input, Badge, Card, Skeleton, ThemeToggle
│   │   ├── lib/             # cn utility, INR currency & date formatters
│   │   └── types/           # OpenAPI-derived DTOs and role definitions
│   ├── pages/               # Homepage, 403 Forbidden, 404 Not Found
│   ├── styles/              # Obsidian & Gold CSS variables and Tailwind layers
│   ├── test/                # Vitest test suites (pricing, auth, cart, guards, images)
│   └── main.tsx             # Application bootstrap
├── e2e/                     # Playwright end-to-end user journey flows
├── index.html               # Fraunces and Inter font preloads
├── vite.config.ts           # Code splitting & chunk optimization
└── package.json
```

---

## 4. Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Setup Environment
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```
Ensure the API base URL is configured:
```env
VITE_API_BASE_URL=https://grahaksensemono.onrender.com
```

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:3000`.

### Run Unit & Integration Tests
```bash
npm test
```
Executes all 25 Vitest unit tests covering pricing, auth, cart, image validation, and role guards.

### Build Production Bundle
```bash
npm run build
```
Generates optimized and code-split production assets in `dist/`.

---

## 5. Security & S3 Upload Protocol

1. **Pre-signed URL Request:** `POST /product/upload-url` validates file size (≤ 2 MB) and MIME types (`image/jpeg`, `image/png`, `image/webp`).
2. **Direct AWS S3 PUT:** The binary is uploaded directly to the returned `uploadUrl` with header `Content-Type: file.type`. The Axios Authorization header is strictly omitted so that AWS S3 signature checks pass without error.
3. **Key Association:** The returned S3 `key` is sent in `imageKeys: [key]` when creating (`POST /product/create`) or editing (`PUT /product/update`) the product listing.

---

## 6. License
Apache License 2.0 © GrahakSense
"# grahaksensefrontend" 
