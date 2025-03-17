import { useCache } from "@/services/CacheService";

interface SingletonInstanceResponse<T> {
  getInstance: () => T;
  setInstance: (instance: T) => void;
}

export default function useSingletonInstance<T>(
  key: string,
): SingletonInstanceResponse<T> {
  const { getCache, setCache } = useCache<T>();

  const getInstance = (): T => {
    const cachedInstance = getCache(key);
    if (cachedInstance !== undefined) {
      return cachedInstance;
    }
    throw new Error(
      "Instance not found for key: " + key + ". Please set the instance first.",
    );
  };

  const setInstance = (instance: T) => {
    setCache(key, instance, null);
  };

  return { getInstance, setInstance };
}
