import React from "react";

/**
 * Tracks a value as `useRef` does, but automatically (re-)computes if and only if dependencies change.
 * @param compute produces the value to store when needed
 * @param deps a dependency array that indicates when a new value should be produced
 * @returns the current, stable value
 */
export function useStableValue<T>(compute: () => T, deps: unknown[]): T {
  const value = React.useRef<T | undefined>();
  const previousDeps = React.useRef<unknown[] | undefined>();

  if (!areSame(deps, previousDeps.current)) {
    previousDeps.current = deps;
    value.current = compute();
  }

  // This will definitely be set because the conditional runs on first call.
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
