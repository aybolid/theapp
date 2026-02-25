import { useCallback, useEffect, useRef, useState } from "react";

type UseDebouncedValueReturnValue<T> = [T, () => void];

export function useDebouncedValue<T = unknown>(
  value: T,
  wait: number = 250,
  options: { leading: boolean } = { leading: false },
): UseDebouncedValueReturnValue<T> {
  const [innerValue, setInnerValue] = useState(value);
  const mountedRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const cooldownRef = useRef(false);

  const cancel = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (mountedRef.current) {
      if (!cooldownRef.current && options.leading) {
        cooldownRef.current = true;
        setInnerValue(value);
      } else {
        cancel();
        timeoutRef.current = window.setTimeout(() => {
          cooldownRef.current = false;
          setInnerValue(value);
        }, wait);
      }
    }
  }, [value, options.leading, wait]);

  useEffect(() => {
    mountedRef.current = true;
    return cancel;
  }, []);

  return [innerValue, cancel];
}
