import { Operation } from "@brandonwilliamscs/data-tools/operation";
import {
  initialStatus,
  TrackedPromise,
} from "@brandonwilliamscs/data-tools/promise";
import { renderHook } from "@testing-library/react-hooks";
import { act } from "react-test-renderer";
import { makeTestPromise, TestPromiseSet } from "./testUtility/makeTestPromise";
import { useOperation } from "./useOperation";

describe("useOperation", () => {
  describe("returned currentStatus", () => {
    it("is the initial status before executing", async () => {
      // Arrange
      const { operation } = makeTestOperation();
      // Act
      const { result } = renderHook((operation) => useOperation(operation), {
        initialProps: operation,
      });
      // Assert
      const [currentStatus] = result.current;
      expect(currentStatus).toBe(initialStatus);
    });
    it("is a pending status immediately when told to execute immediately", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      // Act
      const { result } = renderHook(
        (operation) =>
          useOperation(operation, { initialParams: "initialParameter" }),
        {
          initialProps: operation,
        },
      );
      act(() => {
        const [, execute] = result.current;
        execute("parameter");
      });
      // Assert
      const [currentStatus] = result.current;
      expect(currentStatus).toEqual({
        isPending: true,
        hasError: false,
        source: promiseSets[0].promise,
        hasValue: false,
      });
    });
    it("is a pending status immediately after executing", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      // Act
      const { result } = renderHook((operation) => useOperation(operation), {
        initialProps: operation,
      });
      act(() => {
        const [, execute] = result.current;
        execute("parameter");
      });
      // Assert
      const [currentStatus] = result.current;
      expect(currentStatus).toEqual({
        isPending: true,
        hasError: false,
        source: promiseSets[0].promise,
        hasValue: false,
      });
    });
    it("is a success status once execution resolves", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      // Act
      const { result } = renderHook((operation) => useOperation(operation), {
        initialProps: operation,
      });
      await act(async () => {
        const [, execute] = result.current;
        execute("parameter");
        promiseSets[0].resolve("result");
        await promiseSets[0].promise;
      });
      // Assert
      const [currentStatus] = result.current;
      expect(currentStatus).toEqual({
        isPending: false,
        hasError: false,
        source: promiseSets[0].promise,
        hasValue: true,
        value: "result",
      });
    });
    it("is a pending status with prior value immediately after a second execution", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      // Act
      const { result } = renderHook((operation) => useOperation(operation), {
        initialProps: operation,
      });
      await act(async () => {
        const [, execute] = result.current;
        execute("parameter1");
        promiseSets[0].resolve("result1");
        await promiseSets[0].promise;
        execute("parameter2");
      });
      // Assert
      const [currentStatus] = result.current;
      expect(currentStatus).toEqual({
        isPending: true,
        hasError: false,
        source: promiseSets[1].promise,
        hasValue: true,
        value: "result1",
      });
    });
    it("is not a success status if second execution happens before the first resolves", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      // Act
      const { result } = renderHook((operation) => useOperation(operation), {
        initialProps: operation,
      });
      await act(async () => {
        const [, execute] = result.current;
        execute("parameter1");
        execute("parameter2");
        promiseSets[0].resolve("result1");
        await promiseSets[0].promise;
      });
      // Assert
      const [currentStatus] = result.current;
      expect(currentStatus).toEqual({
        isPending: true,
        hasError: false,
        source: promiseSets[1].promise,
        hasValue: false,
      });
    });
  });
  describe("returned execute function", () => {
    it("calls operation with params and last good value", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      // Act
      const { result } = renderHook((operation) => useOperation(operation), {
        initialProps: operation,
      });
      const execute = result.current[1];
      await act(async () => {
        execute("parameter1");
        promiseSets[0].resolve("result1");
        await promiseSets[0].promise;
        execute("parameter2");
      });
      // Assert
      expect(operation).toHaveBeenLastCalledWith(
        "parameter2",
        expect.objectContaining({
          value: "result1",
        }),
      );
    });
    it("returns the TrackedPromise from the operation", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      // Act
      const { result } = renderHook((operation) => useOperation(operation), {
        initialProps: operation,
      });
      const execute = result.current[1];
      let executeResult: ReturnType<typeof execute> = undefined!;
      act(() => {
        executeResult = execute("parameter1");
      });
      // Assert
      expect(executeResult.promise).toBe(promiseSets[0].promise);
    });
  });
  describe("returned status stream", () => {
    it("emits status changes", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      const statusListener = jest.fn();
      // Act
      const { result } = renderHook((operation) => useOperation(operation), {
        initialProps: operation,
      });
      const [, execute, statusStream] = result.current;
      statusStream.statusChanges.subscribe(statusListener);
      await act(async () => {
        execute("parameter");
        promiseSets[0].resolve("result");
        await promiseSets[0].promise;
      });
      // Assert
      expect(statusListener).toHaveBeenCalledWith({
        isPending: true,
        hasValue: false,
        hasError: false,
        source: promiseSets[0].promise,
      });
      expect(statusListener).toHaveBeenCalledWith({
        isPending: false,
        hasValue: true,
        value: "result",
        hasError: false,
        source: promiseSets[0].promise,
      });
    });
  });
});

function makeTestOperation() {
  const promiseSets: Array<TestPromiseSet<string, string>> = [];
  const operation: Operation<string, string, string> = jest
    .fn()
    .mockImplementation((_, previousStatus) => {
      const promiseSet = makeTestPromise<string, string>();
      promiseSets.push(promiseSet);
      return new TrackedPromise(promiseSet.promise, previousStatus);
    });
  return { operation, promiseSets };
}
