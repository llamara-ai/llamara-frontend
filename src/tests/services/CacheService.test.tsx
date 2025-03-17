import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ReactNode } from "react";
import CacheProvider, { useCache } from "@/services/CacheService"; // Adjust the import path as needed

// Wrapper component to provide the cache context
const wrapper = ({ children }: { children: ReactNode }) => (
  <CacheProvider>{children}</CacheProvider>
);

describe("CacheProvider", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should set and get cache values", () => {
    const { result } = renderHook(() => useCache<string>(), { wrapper });

    act(() => {
      result.current.setCache("testKey", "testValue");
    });

    expect(result.current.getCache("testKey")).toBe("testValue");
  });

  it("should return undefined for non-existent cache keys", () => {
    const { result } = renderHook(() => useCache<string>(), { wrapper });

    expect(result.current.getCache("nonExistentKey")).toBeUndefined();
  });

  it("should delete specific cache entries", () => {
    const { result } = renderHook(() => useCache<string>(), { wrapper });

    act(() => {
      result.current.setCache("key1", "value1");
      result.current.setCache("key2", "value2");
      result.current.deleteCache("key1");
    });

    expect(result.current.getCache("key1")).toBeUndefined();
    expect(result.current.getCache("key2")).toBe("value2");
  });

  it("should clear all cache entries", () => {
    const { result } = renderHook(() => useCache<string>(), { wrapper });

    act(() => {
      result.current.setCache("key1", "value1");
      result.current.setCache("key2", "value2");
      result.current.clearCache();
    });

    expect(result.current.getCache("key1")).toBeUndefined();
    expect(result.current.getCache("key2")).toBeUndefined();
  });

  it("should respect TTL and expire cache entries", () => {
    const { result } = renderHook(() => useCache<string>(), { wrapper });

    act(() => {
      // Set cache with 10 seconds TTL (default)
      result.current.setCache("shortLived", "will expire");
    });

    expect(result.current.getCache("shortLived")).toBe("will expire");

    // Advance time by 11 seconds (past the TTL)
    act(() => {
      vi.advanceTimersByTime(11000);
    });

    // Cache should be expired now
    expect(result.current.getCache("shortLived")).toBeUndefined();
  });

  it("should keep cache entries with null TTL indefinitely", () => {
    const { result } = renderHook(() => useCache<string>(), { wrapper });

    act(() => {
      // Set cache with null TTL (never expires)
      result.current.setCache("immortal", "lives forever", null);
    });

    // Advance time by a very long period
    act(() => {
      vi.advanceTimersByTime(1000 * 60 * 60 * 24 * 365); // 1 year
    });

    // Cache should still be available
    expect(result.current.getCache("immortal")).toBe("lives forever");
  });

  it("should handle custom TTL values", () => {
    const { result } = renderHook(() => useCache<string>(), { wrapper });

    act(() => {
      // Set cache with 5 seconds TTL
      result.current.setCache("customTTL", "custom expiry", 5);
    });

    // Advance time by 4 seconds (should still be valid)
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(result.current.getCache("customTTL")).toBe("custom expiry");

    // Advance time by 2 more seconds (should be expired)
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.getCache("customTTL")).toBeUndefined();
  });

  it("should handle complex data types", () => {
    const { result } = renderHook(
      () => useCache<{ nested: { value: number } }>(),
      { wrapper },
    );
    const complexData = { nested: { value: 42 } };

    act(() => {
      result.current.setCache("complex", complexData);
    });

    expect(result.current.getCache("complex")).toEqual(complexData);
  });

  it("should provide stable context values", () => {
    const { result } = renderHook(
      () => {
        const cache = useCache<string>();
        return {
          initialGetCache: cache.getCache,
          initialSetCache: cache.setCache,
          initialClearCache: cache.clearCache,
          initialDeleteCache: cache.deleteCache,
          cache,
        };
      },
      { wrapper },
    );

    // Store initial function references
    const {
      initialGetCache,
      initialSetCache,
      initialClearCache,
      initialDeleteCache,
    } = result.current;

    // Perform some operations
    act(() => {
      result.current.cache.setCache("key", "value");
      result.current.cache.getCache("key");
    });

    // Function references should remain the same (useMemo is working)
    expect(result.current.cache.getCache).toBe(initialGetCache);
    expect(result.current.cache.setCache).toBe(initialSetCache);
    expect(result.current.cache.clearCache).toBe(initialClearCache);
    expect(result.current.cache.deleteCache).toBe(initialDeleteCache);
  });
});
