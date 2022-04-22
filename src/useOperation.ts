import {
  Operation,
  OperationModel,
} from "@brandonwilliamscs/data-tools/operation";
import {
  PromiseStatus,
  PromiseStatusStream,
  TrackedPromise,
} from "@brandonwilliamscs/data-tools/promise";
import React from "react";
import { useSubscribableValue } from "./useSubscribableValue";

/**
 * Statefully tracks an operation through arbitrary execution calls.
 *
 * @remarks
 *
 * Do not call execute during render! For one, there is a race condition where
 * currentStatus may not be updated. Additionally, any other listeners that set
 * state may break due to React lifecycle expectations. If immediate execution
 * is desired, pass `true` to the `executeImmediately` argument.
 *
 * @param operation the operation to track
 * @param executeImmediately passing initial parameters (or `true` if parameter
 * type is `void`) will ensure that the initial `currentStatus` reflects this
 * first execution.
 * @returns A tuple containing:
 * 1. The current operation status backed by React state
 * 2. An "execute" function to trigger the operation
 * 3. A stream of all operation status values
 */
export function useOperation<Q, R, E = unknown>(
  operation: Operation<Q, R>,
  options?: OperationOptions<Q>,
): [
  PromiseStatus<R, E>,
  (parmeters: Q) => TrackedPromise<R, E>,
  PromiseStatusStream<R, E>,
] {
  const modelRef = React.useRef<OperationModel<Q, R, E>>();
  if (!modelRef.current) {
    // Wrap the operation call in a closure so that it uses the latest value.
    modelRef.current = new OperationModel(
      (parameters) => operation(parameters),
      options?.preserveLatestValue,
    );
    if (options?.executeImmediately) {
      // By type definitions, this will be present and of type `Q`
      // unless `Q` is `void`. Then it's `undefined`.
      const initialParams = (options as any).initialParams;
      modelRef.current.execute(initialParams);
    }
  }
  const operationModel = modelRef.current;
  const currentStatus = useSubscribableValue(
    operationModel.statusChanges,
    operationModel.currentStatus,
  );
  return [currentStatus, operationModel.execute, operationModel];
}

export type OperationOptions<Q> = {
  preserveLatestValue?: boolean;
} & (
  | { executeImmediately?: false }
  | { executeImmediately: true; initialParams: Q }
);
