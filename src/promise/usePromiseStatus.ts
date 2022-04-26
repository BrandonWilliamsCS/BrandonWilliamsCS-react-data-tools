import { PromiseStatus } from "@brandonwilliamscs/data-tools/promise";
import React from "react";
import { useOperation } from "../useOperation";
import { useSubscribableValue } from "../useSubscribableValue";

export function usePromiseStatus<T, E = any>(
  promise: Promise<T> | undefined,
): PromiseStatus<T, E> {
  // Model as an operation that uses incoming promises as-is.
  const [execute, statusStream] = useOperation<Promise<T>, T, E>(
    (promise) => promise,
    // If we're starting with a promise, execute right away to avoid pre-loading state.
    promise && {
      preserveLatestValue: true,
      executeImmediately: true,
      initialParams: promise,
    },
  );
  const currentStatus = useSubscribableValue(
    statusStream.statusChanges,
    statusStream.currentStatus,
  );
  // Every time the promise changes, re-execute.
  const lastExecutedRef = React.useRef(promise);
  if (promise && promise !== lastExecutedRef.current) {
    lastExecutedRef.current = promise;
    execute(promise);
  }
  return currentStatus;
}
