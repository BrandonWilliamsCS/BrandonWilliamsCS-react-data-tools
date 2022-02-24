import React from "react";

/**
 * Tracks a value as `useRef` does, but automatically (re-)computes if and only if dependencies change.
 * @param compute produces the value to store when needed
 * @param deps a dependency array that indicates when a new value should be produced
 * @param cleanup logic to run on old values once they
 * @returns the current, stable value
 */
export function useStableValue<T>(
  compute: () => T,
  deps: unknown[],
  cleanup?: (value: T) => void,
): T {
  const value = React.useRef<T | undefined>();
  const previousDeps = React.useRef<unknown[] | undefined>();
  const hasValue = React.useRef(false);

  if (!areSame(deps, previousDeps.current)) {
    if (cleanup && hasValue.current) {
      // This should be okay outside of a useEffect because it's idempotent.
      cleanup(value.current!);
    }
    previousDeps.current = deps;
    value.current = compute();
    hasValue.current = true;
  }

  // Make sure the final value is cleaned up at the end.
  // Do this ref dance to make sure the latest cleanup logic is used.
  const cleanupRef = React.useRef(cleanup);
  cleanupRef.current = cleanup;
  React.useEffect(() => {
    return () => {
      if (cleanupRef.current && hasValue.current) {
        cleanupRef.current(value.current!);
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
