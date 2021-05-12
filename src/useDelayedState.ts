import React from "react";

/**
 * Splits a "delayed" computation into its latest value and a re-computation trigger.
 * @param compute provides the (promised) state when instructed
 * @returns A promise that resolves when the latest computation completes
 */
export function useDelayedState<T, P = void>(
  compute: (p: P) => Promise<T>,
): [Promise<T> | undefined, (p: P) => Promise<T>] {
  const [resource, setResource] = React.useState<Promise<T>>();

  const load = (p: P) => {
    const resourcePromise = compute(p);
    setResource(resourcePromise);
    return resourcePromise;
  };

  return [resource, load];
}
