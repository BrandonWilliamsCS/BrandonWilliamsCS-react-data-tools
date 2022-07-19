import { AsyncValueModel } from "@brandonwilliamscs/data-tools/async";
import { useSubscribableValue } from "../useSubscribableValue";
import { AsyncStatusGate } from "./AsyncStatusGate";
import React from "react";

export interface AsyncValueModelGateProps<T, E> {
  valueModel: AsyncValueModel<T> | undefined;
  children: (value: T) => React.ReactNode;
  errorContent?: (value: E) => React.ReactNode;
  pendingContent?: React.ReactNode | (() => React.ReactNode);
}

export function AsyncValueModelGate<T, E = any>({
  valueModel,
  children,
  errorContent,
  pendingContent,
}: AsyncValueModelGateProps<T, E>) {
  const status = useSubscribableValue(
    valueModel?.statusChanges,
    valueModel?.currentStatus,
  );
  return (
    <AsyncStatusGate
      status={status}
      errorContent={errorContent}
      pendingContent={pendingContent}
    >
      {children}
    </AsyncStatusGate>
  );
}
