import { api } from "@/core/api";
import { RequestOptions } from "./types";

export const requestQueue = new Map<string, Promise<any>>();

type BatchRequest = {
  resolve: (v: any) => void;
  reject: (e: any) => void;
  options: RequestOptions;
};
const batchQueue = new Map<string, BatchRequest[]>();

const BATCH_INTERVAL = 10; // ms
const MAX_BATCH_SIZE = 10;
let batchTimer: NodeJS.Timeout | null = null;

export async function processBatchQueue() {
  if (batchQueue.size === 0) return;

  const batches = Array.from(batchQueue.entries());
  batchQueue.clear();

  const grouped = new Map<string, BatchRequest[]>();
  for (const [key, requests] of batches) {
    const endpoint = key.split("?")[0];
    const current = grouped.get(endpoint) ?? [];
    grouped.set(endpoint, current.concat(requests));
  }

  for (const [endpoint, requests] of grouped) {
    try {
      const batchData = requests.map((req, index) => ({
        id: index,
        ...req.options,
      }));
      const response = await api.post(`${endpoint}/batch`, {
        requests: batchData,
      });

      requests.forEach((req, index) => {
        const result = response.data.results[index];
        if (result?.error) req.reject(result.error);
        else req.resolve(result.data);
      });
    } catch (error) {
      for (const req of requests) {
        api
          .request(req.options)
          .then((r) => req.resolve(r.data))
          .catch((e) => req.reject(e));
      }
    }
  }
}

export function scheduleBatch() {
  if (batchTimer) clearTimeout(batchTimer);
  batchTimer = setTimeout(processBatchQueue, BATCH_INTERVAL);
}

export function enqueueBatch(cacheKey: string, request: BatchRequest) {
  const queue = batchQueue.get(cacheKey) ?? [];
  queue.push(request);
  batchQueue.set(cacheKey, queue);

  if (queue.length >= MAX_BATCH_SIZE) processBatchQueue();
  else scheduleBatch();
}
