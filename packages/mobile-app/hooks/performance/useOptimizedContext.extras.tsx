import React, { useCallback, useRef } from "react";

export function withPerformanceMonitoring<T>(Component: React.ComponentType<T>, componentName: string) {
  return React.memo((props: T) => {
    const renderStartRef = useRef<number>();
    const renderEndRef = useRef<number>();

    renderStartRef.current = performance.now();

    React.useEffect(() => {
      renderEndRef.current = performance.now();
      const renderTime = (renderEndRef.current as number) - (renderStartRef.current as number);
      if (renderTime > 16) console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    });

    return <Component {...props} />;
  });
}

export function useBatchedUpdates<T extends Record<string, any>>(initialState: T): [T, (updates: Partial<T>) => void] {
  const [state, setState] = React.useState(initialState);
  const pendingUpdatesRef = useRef<Partial<T>>({});
  const updateTimerRef = useRef<NodeJS.Timeout>();

  const batchedSetState = useCallback((updates: Partial<T>) => {
    pendingUpdatesRef.current = { ...pendingUpdatesRef.current, ...updates };
    if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
    updateTimerRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, ...pendingUpdatesRef.current }));
      pendingUpdatesRef.current = {};
    }, 0);
  }, []);

  React.useEffect(() => () => updateTimerRef.current && clearTimeout(updateTimerRef.current), []);

  return [state, batchedSetState];
}


