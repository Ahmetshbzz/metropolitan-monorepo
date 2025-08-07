import { AxiosRequestConfig } from "axios";

export interface RequestOptions extends AxiosRequestConfig {
  cacheTime?: number;
  staleTime?: number;
  retry?: number;
  retryDelay?: number;
  batch?: boolean;
  priority?: "high" | "normal" | "low";
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  staleTimestamp: number;
}
