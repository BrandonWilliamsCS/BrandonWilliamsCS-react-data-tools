import React from "react";
import { Observable, Observer } from "rxjs";
import { useVolatileValue } from "./useVolatileValue";

export function useSubscription<T>(
  subscribable: Observable<T> | undefined,
  observer: Partial<Observer<T>> | ((value: T) => void),
): void {
  const observerRef = useVolatileValue(observer);
  // useLayoutEffect means we subscribe immediately after render, rather than
  // in a new "frame". Otherwise we could miss emissions.
  React.useLayoutEffect(() => {
    if (!subscribable) {
      return;
    }
    const unsubscribable = subscribable.subscribe((value) => {
      const normalizedObserver = normalizeObserver(observerRef.current);
      normalizedObserver.next?.(value);
    });
    return unsubscribable.unsubscribe.bind(unsubscribable);
  }, [subscribable]);
}

export function useSubscribableValue<T>(
  subscribable: Observable<T> | undefined,
): T | undefined;
export function useSubscribableValue<T>(
  subscribable: Observable<T> | undefined,
  initialValue: T,
): T;
export function useSubscribableValue<T>(
  subscribable: Observable<T> | undefined,
  initialValue?: T,
): T | undefined {
  // Note: if initial value is provided, we can safely ignore `| undefined`
  //  as the value will always be a `T`.
  const [value, setValue] = React.useState<T | undefined>(initialValue);
  useSubscription(subscribable, setValue);
  return value;
}

function normalizeObserver<T>(
  observer: Partial<Observer<T>> | ((value: T) => void),
): Partial<Observer<T>> {
  return typeof observer === "function" ? { next: observer } : observer;
}
