import { useState, useCallback, useRef } from 'react';

export function usePullToRefresh(refetchFn: () => Promise<void>) {
  const [refreshing, setRefreshing] = useState(false);
  const isRefreshingRef = useRef(false);

  const onRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    setRefreshing(true);
    try {
      await refetchFn();
    } finally {
      isRefreshingRef.current = false;
      setRefreshing(false);
    }
  }, [refetchFn]);

  return { refreshing, onRefresh };
}

export function useMultiPullToRefresh(refetchFns: (() => Promise<void>)[]) {
  const [refreshing, setRefreshing] = useState(false);
  const isRefreshingRef = useRef(false);

  const onRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    setRefreshing(true);
    try {
      await Promise.allSettled(refetchFns.map(fn => fn()));
    } finally {
      isRefreshingRef.current = false;
      setRefreshing(false);
    }
  }, [refetchFns]);

  return { refreshing, onRefresh };
}
