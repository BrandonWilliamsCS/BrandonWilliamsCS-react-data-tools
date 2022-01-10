import React from "react";
import {
  initialStatus,
  PromiseStatus,
} from "@blueharborsolutions/data-tools/promise";

/**
 * Switches over the possible statuses of a PromiseStatus and renders the
 * appropriate content. If a value is present, whether still pending/in error
 * or not, it will render its children applied to that value. Similarly, pending
 * and error content will show above the main children (in that order) in a way
 * that reflects the current status.
 * @param status the status that determines which piece(s) to render
 * @param children a function that renders the "main" content when a value is available
 * @param errorContent a function that renders error content when the status is in error
 * @param pendingContent content (or a function to render content) to indicate pending status
 * @returns a `ReactNode` that reflects the provided status based on the renderers
 */
export function PromiseStatusGate<T, E = any>({
  status,
  children,
  errorContent,
  pendingContent,
}: PromiseStatusGateProps<T, E>) {
  const adjustedStatus = status ?? initialStatus;
  // The ReactNode type is complex enough that TS doesn't "narrow" here,
  //  but instead falls back to "any". So, explicitly re-limit the result.
  const pendingFunction: () => React.ReactNode = () =>
    typeof pendingContent !== "function" ? pendingContent : pendingContent();
  return (
    <>
      {adjustedStatus.isPending && pendingFunction()}
      {adjustedStatus.hasError && errorContent?.(adjustedStatus.error)}
      {adjustedStatus.hasValue && children(adjustedStatus.value)}
    </>
  );
}

export interface PromiseStatusGateProps<T, E> {
  status: PromiseStatus<T, E> | undefined;
  children: (value: T) => React.ReactNode;
  errorContent?: (value: E) => React.ReactNode;
  pendingContent?: React.ReactNode | (() => React.ReactNode);
}
