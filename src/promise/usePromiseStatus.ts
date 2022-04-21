import {
  PromiseStatus,
  TrackedPromise,
} from "@brandonwilliamscs/data-tools/promise";
import { useOperation } from "../useOperation";

export function usePromiseStatus<T, E = any>(
  promise: Promise<T> | undefined,
): PromiseStatus<T, E> {
  // Model as an operation that uses incoming promises as-is.
  const [currentStatus, execute] = useOperation<Promise<T>, T, E>(
    (promise, prevStatus) => new TrackedPromise(promise, prevStatus),
    // If we're starting with a promise, execute right away to avoid pre-loading state.
    promise && { initialParams: promise },
  );
  // Every time the promise changes, re-execute.
  if (promise && promise !== currentStatus.source) {
    execute(promise);
  }
  return currentStatus;
}
