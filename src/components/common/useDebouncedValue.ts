import { useEffect, useState } from "react";

// Valor que se actualiza recién cuando se deja de escribir
export const useDebouncedValue = (value: string, delayMs = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);
  return debounced;
};
