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
  describe("returned execute function", () => {
    it("calls operation with params", async () => {
      // Arrange
      const { operation } = makeTestOperation();
      // Act
      const { result } = renderHook((operation) => useOperation(operation), {
        initialProps: operation,
      });
      const [execute] = result.current;
      await act(async () => {
        execute("parameter1");
      });
      // Assert
      expect(operation).toHaveBeenLastCalledWith("parameter1");
    });
    it("returns the TrackedPromise from the operation", async () => {
      // Arrange
      const { operation, promiseSets } = makeTestOperation();
      // Act
      const { result } = renderHook((operation) => useOperation(operation), {
        initialProps: operation,
      });
      const [execute] = result.current;
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
      const [execute, statusStream] = result.current;
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

    describe("currentStatus", () => {
      it("is the initial status before executing", async () => {
        // Arrange
        const { operation } = makeTestOperation();
        // Act
        const { result } = renderHook((operation) => useOperation(operation), {
          initialProps: operation,
        });
        // Assert
        const [, statusStream] = result.current;
        expect(statusStream.currentStatus).toBe(initialStatus);
      });
      it("is a pending status immediately when told to execute immediately", async () => {
        // Arrange
        const { operation, promiseSets } = makeTestOperation();
        // Act
        const { result } = renderHook(
          (operation) =>
            useOperation(operation, {
              executeImmediately: true,
              initialParams: "initialParameter",
            }),
          {
            initialProps: operation,
          },
        );
        act(() => {
          const [execute] = result.current;
          execute("parameter");
        });
        // Assert
        const [, statusStream] = result.current;
        expect(statusStream.currentStatus).toEqual({
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
          const [execute] = result.current;
          execute("parameter");
        });
        // Assert
        const [, statusStream] = result.current;
        expect(statusStream.currentStatus).toEqual({
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
          const [execute] = result.current;
          execute("parameter");
          promiseSets[0].resolve("result");
          await promiseSets[0].promise;
        });
        // Assert
        const [, statusStream] = result.current;
        expect(statusStream.currentStatus).toEqual({
          isPending: false,
          hasError: false,
          source: promiseSets[0].promise,
          hasValue: true,
          value: "result",
        });
      });
      it("is a pending status immediately after a second execution", async () => {
        // Arrange
        const { operation, promiseSets } = makeTestOperation();
        // Act
        const { result } = renderHook((operation) => useOperation(operation), {
          initialProps: operation,
        });
        await act(async () => {
          const [execute] = result.current;
          execute("parameter1");
          promiseSets[0].resolve("result1");
          await promiseSets[0].promise;
          execute("parameter2");
        });
        // Assert
        const [, statusStream] = result.current;
        expect(statusStream.currentStatus).toEqual({
          isPending: true,
          hasError: false,
          source: promiseSets[1].promise,
          hasValue: false,
        });
      });
      it("maintains prior value when instructed", async () => {
        // Arrange
        const { operation, promiseSets } = makeTestOperation();
        // Act
        const { result } = renderHook(
          (operation) =>
            useOperation(operation, {
              preserveLatestValue: true,
            }),
          {
            initialProps: operation,
          },
        );
        await act(async () => {
          const [execute] = result.current;
          execute("parameter1");
          promiseSets[0].resolve("result1");
          await promiseSets[0].promise;
          execute("parameter2");
        });
        // Assert
        const [, statusStream] = result.current;
        expect(statusStream.currentStatus).toEqual(
          expect.objectContaining({
            hasValue: true,
            value: "result1",
          }),
        );
      });
      it("is not a success status if second execution happens before the first resolves", async () => {
        // Arrange
        const { operation, promiseSets } = makeTestOperation();
        // Act
        const { result } = renderHook((operation) => useOperation(operation), {
          initialProps: operation,
        });
        await act(async () => {
          const [execute] = result.current;
          execute("parameter1");
          execute("parameter2");
          promiseSets[0].resolve("result1");
          await promiseSets[0].promise;
        });
        // Assert
        const [, statusStream] = result.current;
        expect(statusStream.currentStatus).toEqual({
          isPending: true,
          hasError: false,
          source: promiseSets[1].promise,
          hasValue: false,
        });
      });
    });
  });
});

function makeTestOperation() {
  const promiseSets: Array<TestPromiseSet<string, string>> = [];
  const operation: Operation<string, string> = jest
    .fn()
    .mockImplementation(() => {
      const promiseSet = makeTestPromise<string, string>();
      promiseSets.push(promiseSet);
      return promiseSet.promise;
    });
  return { operation, promiseSets };
}
