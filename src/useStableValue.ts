import React from "react";
import { useVolatileValue } from "./useVolatileValue";

/**
 * Tracks a value as `useRef` does, but automatically (re-)computes if and only if dependencies change.
 * @param compute produces the value to store when needed
 * @param deps a dependency array that indicates when a new value should be produced
 * @param cleanup logic to run on old values once they stop being used
 * @returns the current, stable value
 */
export function useStableValue<T>(
  compute: () => T,
  deps: unknown[],
  cleanup?: (value: T) => void,
): T {
  const value = React.useRef<T | undefined>();
  const previousDeps = React.useRef<unknown[] | undefined>();

  if (!areSame(deps, previousDeps.current)) {
    // Run cleanup on the value, if this isn't the first.
    // This should be okay outside of a useEffect because it's idempotent.
    if (cleanup && previousDeps.current) {
      cleanup(value.current!);
    }
    previousDeps.current = deps;
    value.current = compute();
  }

  // Make sure the final value is cleaned up at the end.
  const cleanupRef = useVolatileValue(cleanup);
  React.useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current(value.current!);
        // Cleaned-up objects must be re-created in case of re-mount.
        previousDeps.current = undefined;
        value.current = undefined;
      }
    };
  }, []);

  // This will definitely be set to a `T` because the conditional runs on first call.
  return value.current!;
}

function areSame(a: unknown[] | undefined, b: unknown[] | undefined) {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((dep, index) => dep === b[index])
  );
}
