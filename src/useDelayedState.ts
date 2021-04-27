import React from "react";

/**
 * Splits a "delayed" computation into its latest value and a re-computation trigger.
 * @param compute provides the (promised) state when instructed
 * @returns A promise that resolves when the latest computation completes
 */
export function useDelayedState<T, P = void>(
  compute: ((p: P) => Promise<T>) | undefined,
): [Promise<T>, (p: P) => Promise<T>] {
  const [resource, setResource] = React.useState<Promise<T>>(
    new Promise(() => {}),
  );

  const load = (p: P) => {
    if (!compute) {
      return resource;
    }
    const resourcePromise = compute(p);
    setResource(resourcePromise);
    return resourcePromise;
  };

  return [resource, load];
}
