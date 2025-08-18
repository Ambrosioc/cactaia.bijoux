export const PERF_OPTIMIZATIONS_ENABLED = process.env.NEXT_PUBLIC_PERF_OPTIMIZATIONS_ENABLED === 'true';

// Server-side revalidation windows (in seconds)
export const REVALIDATE_PLP_SECONDS = 180; // 3 minutes (60–300s window)
export const REVALIDATE_PDP_SECONDS = 300; // 5 minutes (120–600s window)

// CDN cache settings (in seconds)
export const CDN_S_MAXAGE_PLP = 180;
export const CDN_STALE_WHILE_REVALIDATE_PLP = 300;
export const CDN_S_MAXAGE_PDP = 300;
export const CDN_STALE_WHILE_REVALIDATE_PDP = 600;

// Storage namespace/versioning
export const STORAGE_NAMESPACE = 'cactaia';
export const STORAGE_VERSION = 'v1';

export const buildNamespacedKey = (key: string) => `${STORAGE_NAMESPACE}:${STORAGE_VERSION}:${key}`;


