import React, { useCallback, useMemo, useRef, useSyncExternalStore } from "react";

export interface OptimizedContextOptions<T> {
  selector?: (state: T) => any;
  equalityFn?: (a: any, b: any) => boolean;
  debounce?: number;
}

const defaultEqualityFn = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => a[key] === b[key]);
};

export function createOptimizedContext<T>() {
  const subscribers = new Set<() => void>();
  let currentState: T;

  const subscribe = (callback: () => void) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  };

  const getSnapshot = () => currentState;

  const setState = (newState: T) => {
    if (currentState !== newState) {
      currentState = newState;
      subscribers.forEach((callback) => callback());
    }
  };

  return {
    Provider: ({ value, children }: { value: T; children: React.ReactNode }) => {
      currentState = value;
      return <>{children}</>;
    },

    useOptimizedContext: (options: OptimizedContextOptions<T> = {}) => {
      const { selector, equalityFn = defaultEqualityFn, debounce = 0 } = options;

      const previousSelectedRef = useRef<any>();
      const debounceTimerRef = useRef<NodeJS.Timeout>();

      const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

      const selectedState = useMemo(() => {
        const selected = selector ? selector(state) : (state as any);
        if (previousSelectedRef.current && equalityFn(previousSelectedRef.current, selected)) {
          return previousSelectedRef.current;
        }
        previousSelectedRef.current = selected;
        return selected;
      }, [state, selector, equalityFn]);

      const [debouncedState, setDebouncedState] = React.useState(selectedState);

      React.useEffect(() => {
        if (debounce > 0) {
          if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = setTimeout(() => setDebouncedState(selectedState), debounce);
          return () => debounceTimerRef.current && clearTimeout(debounceTimerRef.current);
        }
        setDebouncedState(selectedState);
      }, [selectedState, debounce]);

      return debounce > 0 ? (debouncedState as any) : (selectedState as any);
    },

    setState,
  };
}


