import { createContext, useContext, ReactNode, useMemo } from "react";

interface ContextType<T> {
  getCache: (key: string) => T | undefined;
  setCache: (key: string, value: T, ttl?: number | null) => void;
  clearCache: () => void;
  deleteCache: (key: string) => void;
}

interface CacheBody<T> {
  expiry: Date | null;
  data: T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CacheContext = createContext<ContextType<any> | null>(null);

export function useCache<T>() {
  return useContext(CacheContext) as ContextType<T>;
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export default function CacheProvider<T>({
  children,
}: Readonly<{ children: ReactNode }>) {
  const map = new Map<string, CacheBody<T>>();

  function getCache(key: string) {
    const cacheValue = map.get(key);
    if (!cacheValue) return undefined;
    if (
      cacheValue.expiry &&
      new Date().getTime() > cacheValue.expiry.getTime()
    ) {
      map.delete(key);
      return undefined;
    }
    return cacheValue.data;
  }

  // ttl in seconds
  // ttl = null means cache forever, so no expiry
  function setCache(key: string, value: T, ttl: number | null = 10) {
    if (ttl === null) {
      map.set(key, {
        expiry: null,
        data: value,
      });
      return;
    }
    const t = new Date();
    t.setSeconds(t.getSeconds() + ttl);
    map.set(key, {
      expiry: t,
      data: value,
    });
  }

  function clearCache() {
    map.clear();
  }

  function deleteCache(key: string) {
    map.delete(key);
  }

  const contextValue = useMemo(
    () => ({ getCache, setCache, clearCache, deleteCache }),
    [getCache, setCache, clearCache, deleteCache],
  );

  return (
    <CacheContext.Provider value={contextValue}>
      {children}
    </CacheContext.Provider>
  );
}
