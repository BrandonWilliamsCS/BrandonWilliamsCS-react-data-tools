import { PromiseStatusStream } from "@brandonwilliamscs/data-tools/promise";
import React from "react";
import { useSubscribableValue } from "../useSubscribableValue";

import { PromiseStatusGate } from "./PromiseStatusGate";

export interface PromiseStatusStreamGateProps<T, E> {
  statusStream: PromiseStatusStream<T> | undefined;
  children: (value: T) => React.ReactNode;
  errorContent?: (value: E) => React.ReactNode;
  pendingContent?: React.ReactNode | (() => React.ReactNode);
}

export function PromiseStatusStreamGate<T, E = any>({
  statusStream,
  children,
  errorContent,
  pendingContent,
}: PromiseStatusStreamGateProps<T, E>) {
  const status = useSubscribableValue(
    statusStream?.statusChanges,
    statusStream?.currentStatus,
  );
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
