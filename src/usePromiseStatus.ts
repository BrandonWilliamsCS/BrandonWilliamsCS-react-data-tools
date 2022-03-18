import React from "react";
import {
  PromiseStatus,
  trackPromiseStatus,
} from "@brandonwilliamscs/data-tools/promise";

export function usePromiseStatus<T, E = any>(
  promise: Promise<T>,
): PromiseStatus<T, E>;
export function usePromiseStatus<T, E = any>(
  promise: Promise<T> | undefined,
): PromiseStatus<T, E> | undefined;
export function usePromiseStatus<T, E = any>(
  promise: Promise<T> | undefined,
): PromiseStatus<T, E> | undefined {
  // Track as state to trigger render and ref for immediate return.
  const [, setData] = React.useState<PromiseStatus<T, E>>();
  const currentRef = React.useRef<PromiseStatus<T, E>>();

  // We should avoid setting state after unmount.
  const unmountedRef = React.useRef(false);
  React.useEffect(
    () => () => {
      unmountedRef.current = true;
    },
    [],
  );

  // Track status immediately - not in useEffect - so there will always be a status for this promise.
  if (promise && promise !== currentRef.current?.source) {
    const onStatusChange = (nextStatus: PromiseStatus<T, E>) => {
      // Don't overwrite a more recent promise's status with this one's.
      if (promise !== nextStatus.source) {
        return;
      }
      currentRef.current = nextStatus;
      if (!unmountedRef.current) {
        setData(nextStatus);
      }
    };
    trackPromiseStatus(promise, onStatusChange, currentRef.current);
  }

  return currentRef.current;
}
