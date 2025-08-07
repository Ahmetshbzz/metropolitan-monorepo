import { api } from "@/core/api";

api.interceptors.request.use((config: any) => {
  (config as any).metadata = { startTime: Date.now() };
  return config;
});

api.interceptors.response.use(
  (response: any) => {
    const duration = Date.now() - (response.config as any)?.metadata?.startTime;
    if (duration > 1000)
      console.warn(
        `Slow API request: ${response.config?.url} took ${duration}ms`
      );
    return response;
  },
  (error: any) => {
    const duration = Date.now() - (error.config as any)?.metadata?.startTime;
    console.error(
      `API request failed: ${error.config?.url} after ${duration}ms`
    );
    return Promise.reject(error);
  }
);
