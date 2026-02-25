import {
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type UseDebouncedStateReturnValue<T> = [
  T,
  (newValue: SetStateAction<T>) => void,
];

export function useDebouncedState<T = unknown>(
  defaultValue: T,
  wait: number = 250,
  options: { leading: boolean } = { leading: false },
): UseDebouncedStateReturnValue<T> {
  const [value, setValue] = useState(defaultValue);
  const timeoutRef = useRef<number | null>(null);
  const leadingRef = useRef(true);

  const clearTimeout = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
  };
  useEffect(() => clearTimeout, []);

  const debouncedSetValue = useCallback(
    (newValue: SetStateAction<T>) => {
      clearTimeout();
      if (leadingRef.current && options.leading) {
        setValue(newValue);
      } else {
        timeoutRef.current = window.setTimeout(() => {
          leadingRef.current = true;
          setValue(newValue);
        }, wait);
      }
      leadingRef.current = false;
    },
    [options.leading],
  );

  return [value, debouncedSetValue] as const;
}
