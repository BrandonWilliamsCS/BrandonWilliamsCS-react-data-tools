import { createValueModel } from "@brandonwilliamscs/data-tools/async";
import { makeTestPromise, TestPromiseSet } from "./makeTestPromise";

export function makeTestAsyncValueModel<T, E = unknown>(
  waitForDemand?: boolean,
) {
  const promiseSets: Array<TestPromiseSet<string, string>> = [];
  const valueModel = createValueModel<T, E>(
    jest.fn().mockImplementation(() => {
      const promiseSet = makeTestPromise<string, string>();
      promiseSets.push(promiseSet);
      return promiseSet.promise;
    }),
    waitForDemand,
  );

  return {
    valueModel,
    promiseSets,
  };
}
