import React from "react";

import { PromiseStatus, processPromise, succeed, fail } from "./PromiseStatus";

export function usePromiseStatus<T, E = any>(
  promise: Promise<T> | undefined,
): PromiseStatus<T, E> {
  const [currentState, setData] = React.useState<PromiseStatus<T, E>>(
    processPromise<T, E>(promise ?? eternalPromise),
  );

  React.useEffect(() => {
    // Pay attention to when a new promise is given, to mark the old one as stale.
    // This will let us ignore old data AND prevent post-unmount state changes.
    let stale = false;
    let unsubscribe = () => {
      stale = true;
    };

    if (!promise) {
      return unsubscribe;
    }

    // Immediately record that the data is being processed.
    setData((prevState) => processPromise(promise, prevState));

    promise
      .then((result) => {
        // Don't overwrite a more recent promise's status with this one's.
        if (stale) {
          return;
        }
        setData((prevState) => succeed(prevState, result));
      })
      .catch((error) => {
        // Don't overwrite a more recent promise's status with this one's.
        if (stale) {
          return;
        }
        setData((prevState) => fail(prevState, error));
      });
    return unsubscribe;
  }, [promise]);

  return currentState;
}

const eternalPromise = new Promise<never>(() => {});
