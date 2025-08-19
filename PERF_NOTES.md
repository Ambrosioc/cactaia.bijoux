## Perf Optimizations Flag

- Feature flag: `NEXT_PUBLIC_PERF_OPTIMIZATIONS_ENABLED` (default off). Toggle to enable ISR, CDN headers, and client storage policies.

## Server/CDN Cache

- Catalog API (`/api/catalog`) is cacheable with `s-maxage` and `stale-while-revalidate` when flag is enabled.
- PDP (`app/produit/[slug]/page.tsx`) uses `revalidate` window when flag is enabled.
- Global static headers for Next static assets and images set to long-term immutable.

## Client Storage

- Added `lib/storage.ts` providing namespaced, versioned storage with TTL and SSR-safe fallback.
- Namespacing: `cactaia:v1:<key>`.
- Cleanup on boot removes expired/wrong-namespace entries.

## Next Steps (planned PRs)

- perf/store: refactor Zustand into slices with selective persistence and selectors.
- perf/data: standardize on React Query for product catalog and PDP hydration with stable keys and stale times.
- perf/db: ensure indexes on `produits(category, prix, slug, updated_at)` and keyset pagination.

## Measurement

- Add scripts `perf:before` and `perf:after` using Lighthouse CI; store results in `logs/` and compare.


