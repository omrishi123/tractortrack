
"use client";

import { useState, useEffect, useCallback } from 'react';

// Guard against server-side execution
const isBrowser = typeof window !== 'undefined';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const readValue = useCallback((): T => {
    if (!isBrowser) {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = (value: T | ((val: T) => T)) => {
    if (!isBrowser) {
      console.warn(`Tried setting localStorage key "${key}" even though environment is not a client`);
      return;
    }

    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) => {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };
  
  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);


  return [storedValue, setValue];
}
