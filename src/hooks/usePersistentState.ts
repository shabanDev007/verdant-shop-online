import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

/**
 * Persists client state without reading browser storage during server rendering.
 * Waiting until storage has been read also prevents the initial value from
 * overwriting an existing saved value on mount.
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T,
  isValid: (value: unknown) => value is T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState(initialValue);
  const [storageLoaded, setStorageLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedValue: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
      if (isValid(savedValue)) setValue(savedValue);
    } catch {
      // Ignore unavailable storage and malformed values.
    } finally {
      setStorageLoaded(true);
    }
  }, [key, isValid]);

  useEffect(() => {
    if (!storageLoaded) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // The application remains usable when storage is unavailable or full.
    }
  }, [key, storageLoaded, value]);

  return [value, setValue];
}
