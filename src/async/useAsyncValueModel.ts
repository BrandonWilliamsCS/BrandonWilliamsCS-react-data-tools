import { AsyncValueModel } from "@brandonwilliamscs/data-tools/async";
import { AsyncStatus } from "@brandonwilliamscs/data-tools/async/AsyncStatus";
import { useSubscribableValue } from "../useSubscribableValue";

export function useAsyncValueModel<T>(
  statusStream: AsyncValueModel<T>,
): AsyncStatus<T> {
  return useSubscribableValue(
    statusStream.statusChanges,
    statusStream.currentStatus,
  );
}
