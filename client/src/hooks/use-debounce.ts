import { useState, useEffect } from "react";

/**
 * useDebounce — delays updating the output value until the input
 * has stopped changing for `delay` ms.
 *
 * @example
 *   const debouncedQuery = useDebounce(searchInput, 300);
 *   // use debouncedQuery as the RTK Query arg
 */
export function useDebounce<T>(value: T, delay = 300): T {
    const [debounced, setDebounced] = useState<T>(value);

    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);

    return debounced;
}