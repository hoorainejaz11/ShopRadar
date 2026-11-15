import { useCallback, useEffect, useRef, useState } from 'react';
import { isFresh, peek, subscribe } from './cache';

// `fetcher(force)` must be a lib/api.js function that reads/writes the cache itself (cachedFetch) under `key`;
// this hook only reads the cache and triggers it. (Wrapping in cachedFetch here too would deadlock on the shared in-flight key.)
// Cache-first data hook: shows cached data immediately, refetches in the background when stale,
// always clears `loading`/`refreshing` when a request settles (success or failure).
export function useQuery(key, fetcher, { ttl = 60000, enabled = true } = {}) {
  const [data, setData] = useState(() => (key ? peek(key) : undefined));
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(() => !!key && enabled && peek(key) === undefined);
  const [refreshing, setRefreshing] = useState(false);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const alive = useRef(true);
  const reqId = useRef(0);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const run = useCallback(
    async (force) => {
      if (!key || !enabled) return;
      const id = ++reqId.current; // ignore out-of-order responses
      try {
        const result = await fetcherRef.current(!!force);
        if (alive.current && id === reqId.current) {
          setData(result);
          setError(null);
        }
      } catch (e) {
        if (alive.current && id === reqId.current) setError(e);
      } finally {
        if (alive.current && id === reqId.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [key, enabled]
  );

  // Key change / enable: show whatever is cached for the new key, then revalidate if stale.
  useEffect(() => {
    if (!key || !enabled) return;
    const cached = peek(key);
    setData(cached);
    setLoading(cached === undefined);
    if (!isFresh(key, ttl)) run(false);
  }, [key, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Invalidation elsewhere (after a mutation) -> refetch and update.
  useEffect(() => {
    if (!key) return;
    return subscribe((k) => {
      if (k !== key) return;
      const v = peek(key);
      if (v === undefined) run(true);
      else if (alive.current) setData(v);
    });
  }, [key, run]);

  const refetch = useCallback(() => run(true), [run]);
  const refresh = useCallback(async () => {
    setRefreshing(true);
    await run(true);
  }, [run]);
  // Called on screen focus: only hits the network when the cache is stale.
  const revalidate = useCallback(() => {
    if (key && enabled && !isFresh(key, ttl)) run(false);
  }, [key, enabled, ttl, run]);

  return { data, error, loading, refreshing, refetch, refresh, revalidate };
}
