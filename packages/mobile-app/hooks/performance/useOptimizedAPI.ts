//  "useOptimizedAPI.ts"
//  metropolitan app
//  Optimized API hook with request batching and caching

import { useCallback, useRef, useState } from "react";
import { getCacheStats, invalidateCache } from "./use-optimized-api/cache";
import "./use-optimized-api/interceptors";
import {
  createPrefetch,
  createRequestFunction,
} from "./use-optimized-api/request-factory";

export function useOptimizedAPI<T = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController>();

  // Cancel ongoing requests on unmount
  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const request = useCallback(
    createRequestFunction<T>(setLoading, setError, abortControllerRef),
    []
  );

  // Refresh data in background
  const refreshInBackground = useCallback(() => {}, []);

  // Prefetch data
  const prefetch = useCallback(createPrefetch(request), [request]);

  // Invalidate cache
  const invalidate = useCallback((pattern?: string) => {
    invalidateCache(pattern);
  }, []);

  return {
    request,
    prefetch,
    invalidate,
    loading,
    error,
    // Cache statistics
    getCacheStats,
  };
}
