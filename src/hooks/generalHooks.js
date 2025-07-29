import { useEffect, useState, useRef, useCallback } from 'react';

export function useDebounced(value = 200, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

const useKey = () => {
  const keysRef = useRef({});
  
  const getKey = useCallback((address, index) => {
    let key = address?.replace(/[^0-9A-Za-z]/g, '-');
    
    if (!address) {
      key = index;
    }

    key = String(key);
    
    if (keysRef.current[key]) {
      const newKey = key + '-' + keysRef.current[key];
      keysRef.current[key] += 1;
      return newKey;
    } else {
      keysRef.current[key] = 2;
      return key;
    }
  }, []);
  
  const clearKeys = useCallback(() => {
    keysRef.current = {};
  }, []);
  
  const getCurrentKeys = useCallback(() => {
    return { ...keysRef.current };
  }, []);
  
  return {
    getKey,
    clearKeys,
    getCurrentKeys
  };
};

export default useKey;