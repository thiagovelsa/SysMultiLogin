import { useState, useEffect, useCallback } from 'react';

// A wrapper for JSON.parse that handles errors
function safeJSONParse<T>(value: string | null, fallback: T): T {
  if (value === null) {
    return fallback;
  }
  try {
    return JSON.parse(value) as T;
  } catch (e) {
    console.error('Failed to parse JSON from localStorage', e);
    return fallback;
  }
}

function getInitialValue<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  const saved = window.localStorage.getItem(key);
  return safeJSONParse(saved, defaultValue);
}

export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => getInitialValue(key, defaultValue));

  // Effect to update localStorage when value changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error(`Failed to set localStorage key "${key}"`, e);
      }
    }
  }, [key, value]);
  
  // Effect to listen for changes from other tabs
  const handleStorageChange = useCallback((event: StorageEvent) => {
    if (event.key === key && event.newValue !== event.oldValue) {
       setValue(safeJSONParse(event.newValue, defaultValue));
    }
  }, [key, defaultValue]);

  useEffect(() => {
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    }
  }, [handleStorageChange]);


  return [value, setValue];
}
