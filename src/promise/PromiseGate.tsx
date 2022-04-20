import React from "react";

import { usePromiseStatus } from "./usePromiseStatus";
import { PromiseStatusGate } from "./PromiseStatusGate";

export function PromiseGate<T, E = any>({
  promise,
  children,
  errorContent,
  pendingContent,
}: PromiseGateProps<T, E>) {
  const status = usePromiseStatus<T, E>(promise);
  return (
    <PromiseStatusGate
      status={status}
      errorContent={errorContent}
      pendingContent={pendingContent}
    >
      {children}
    </PromiseStatusGate>
  );
}

export interface PromiseGateProps<T, E> {
  promise: Promise<T> | undefined;
  children: (value: T) => React.ReactNode;
  errorContent?: (value: E) => React.ReactNode;
  pendingContent?: React.ReactNode | (() => React.ReactNode);
}
