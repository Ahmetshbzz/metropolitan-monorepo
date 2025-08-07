import { MutableRefObject } from "react";
import { api } from "@/core/api";
import { RequestOptions } from "./types";
import { enqueueBatch, requestQueue } from "./batching";
import { setCached, getCached, cache } from "./cache";

export function createRequestFunction<T = any>(
  setLoading: (v: boolean) => void,
  setError: (e: any) => void,
  abortControllerRef: MutableRefObject<AbortController | undefined>
) {
  return async function request(url: string, options: RequestOptions = {}): Promise<T> {
    const { cacheTime = 5 * 60 * 1000, staleTime = 60 * 1000, retry = 3, retryDelay = 1000, batch = false, priority = "normal", ...axiosOptions } = options;

    const cacheKey = `${url}:${JSON.stringify(axiosOptions.params || {})}`;

    const cached = getCached<T>(cacheKey);
    if (cached) {
      const now = Date.now();
      if (now < cached.timestamp + cacheTime) {
        if (now > cached.staleTimestamp) refreshInBackground(url, options);
        return cached.data as T;
      }
    }

    const inFlight = requestQueue.get(cacheKey);
    if (inFlight) return inFlight;

    if (batch && options.method === "GET") {
      return new Promise((resolve, reject) => {
        enqueueBatch(cacheKey, { resolve, reject, options: { url, ...axiosOptions } });
      });
    }

    const makeRequest = async (attemptCount = 0): Promise<T> => {
      try {
        setLoading(true);
        setError(null);
        abortControllerRef.current = new AbortController();

        const headers = { ...axiosOptions.headers, "X-Priority": priority } as Record<string, string>;

        const response = await api.request<T>({ url, ...axiosOptions, headers, signal: abortControllerRef.current.signal });

        const now = Date.now();
        setCached(cacheKey, { data: response.data, timestamp: now, staleTimestamp: now + staleTime });
        return response.data;
      } catch (err: any) {
        if (attemptCount < retry - 1 && !err.message?.includes("aborted")) {
          await new Promise((r) => setTimeout(r, retryDelay * (attemptCount + 1)));
          return makeRequest(attemptCount + 1);
        }
        setError(err);
        throw err;
      } finally {
        setLoading(false);
        requestQueue.delete(cacheKey);
      }
    };

    const requestPromise = makeRequest();
    requestQueue.set(cacheKey, requestPromise);
    return requestPromise;
  };
}

export async function refreshInBackground(url: string, options: RequestOptions) {
  try {
    const response = await api.request({ url, ...options });
    const cacheKey = `${url}:${JSON.stringify(options.params || {})}`;
    const now = Date.now();
    setCached(cacheKey, { data: response.data, timestamp: now, staleTimestamp: now + (options.staleTime || 60000) });
  } catch {
    // silent
  }
}

export function createPrefetch<T = any>(request: (url: string, options?: RequestOptions) => Promise<T>) {
  return async function prefetch(url: string, options: RequestOptions = {}) {
    const cacheKey = `${url}:${JSON.stringify(options.params || {})}`;
    if (cache.has(cacheKey)) return;
    try {
      await request(url, { ...options, priority: "low" });
    } catch {
      // silent
    }
  };
}


