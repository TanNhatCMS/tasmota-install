/**
 * Wraps fetch with CORS proxy support for cross-origin requests
 */
export declare const corsProxyFetch: (url: string, options?: RequestInit) => Promise<Response>;
