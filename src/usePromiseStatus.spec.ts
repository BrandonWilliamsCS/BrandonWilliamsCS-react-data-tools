import { act, renderHook } from "@testing-library/react-hooks";

import { usePromiseStatus } from "./usePromiseStatus";

describe("usePromiseStatus", () => {
  it("returns undefined before the first promise", async () => {
    // Arrange
    const promise: Promise<string> | undefined = undefined;
    // Act
    const { result } = renderHook(
      (props) => usePromiseStatus<string, string>(props.promise),
      { initialProps: { promise } },
    );
    // Assert
    const currentState = result.current;
    expect(currentState).toBe(undefined);
  });

  it("returns pending state during the first promise", async () => {
    // Arrange
    const { promise } = makePromise<string, string>();
    // Act
    const { result } = renderHook(
      (props) => usePromiseStatus<string, string>(props.promise),
      { initialProps: { promise } },
    );
    // Assert
    const currentState = result.current;
    expect(currentState).toMatchObject({
      isPending: true,
      hasError: false,
      hasValue: false,
      source: promise,
    });
  });

  it("returns a rest state with a result after a successful first promise", async () => {
    // Arrange
    const { promise, resolve } = makePromise<string, string>();
    // Act
    const { result } = renderHook(
      (props) => usePromiseStatus<string, string>(props.promise),
      { initialProps: { promise } },
    );
    await act(async () => {
      resolve("first");
      await promise;
    });
    // Assert
    const currentState = result.current;
    expect(currentState).toMatchObject({
      isPending: false,
      hasError: false,
      hasValue: true,
      value: "first",
      source: promise,
    });
  });

  it("returns a rest state with an error after a failed first promise", async () => {
    // Arrange
    const { promise, reject } = makePromise<string, string>();
    // Act
    const { result } = renderHook(
      (props) => usePromiseStatus<string, string>(props.promise),
      { initialProps: { promise } },
    );
    await act(async () => {
      reject("first");
      try {
        await promise;
      } catch {}
    });
    // Assert
    const currentState = result.current;
    expect(currentState).toMatchObject({
      isPending: false,
      hasError: true,
      error: "first",
      hasValue: false,
      source: promise,
    });
  });

  it("returns a processing state with a result during a second promise after a successful first call", async () => {
    // Arrange
    const { promise, resolve } = makePromise<string, string>();
    const { promise: secondPromise } = makePromise<string, string>();
    // Act
    const { result, rerender } = renderHook(
      (props) => usePromiseStatus<string, string>(props.promise),
      { initialProps: { promise } },
    );
    await act(async () => {
      resolve("first");
      await promise;
    });
    rerender({ promise: secondPromise });
    // Assert
    const currentState = result.current;
    expect(currentState).toMatchObject({
      isPending: true,
      hasError: false,
      hasValue: true,
      value: "first",
      source: secondPromise,
    });
  });

  it("returns a rest state with second result after two successful promises", async () => {
    // Arrange
    const { promise, resolve } = makePromise<string, string>();
    const { promise: secondPromise, resolve: secondResolve } =
      makePromise<string, string>();
    // Act
    const { result, rerender } = renderHook(
      (props) => usePromiseStatus<string, string>(props.promise),
      { initialProps: { promise } },
    );
    await act(async () => {
      resolve("first");
      await promise;
    });
    rerender({ promise: secondPromise });
    await act(async () => {
      secondResolve("second");
      await secondPromise;
    });
    // Assert
    const currentState = result.current;
    expect(currentState).toMatchObject({
      isPending: false,
      hasError: false,
      hasValue: true,
      value: "second",
      source: secondPromise,
    });
  });

  it("returns a processing state with no error during a second promise after a failed first call", async () => {
    // Arrange
    const { promise, reject } = makePromise<string, string>();
    const { promise: secondPromise } = makePromise<string, string>();
    // Act
    const { result, rerender } = renderHook(
      (props) => usePromiseStatus<string, string>(props.promise),
      { initialProps: { promise } },
    );
    await act(async () => {
      reject("first");
      try {
        await promise;
      } catch {}
    });
    rerender({ promise: secondPromise });
    // Assert
    const currentState = result.current;
    expect(currentState).toMatchObject({
      isPending: true,
      hasError: false,
      hasValue: false,
      source: secondPromise,
    });
  });

  it("returns a rest state with second error after two failed promises", async () => {
    // Arrange
    const { promise, reject } = makePromise<string, string>();
    const { promise: secondPromise, reject: secondReject } =
      makePromise<string, string>();
    // Act
    const { result, rerender } = renderHook(
      (props) => usePromiseStatus<string, string>(props.promise),
      { initialProps: { promise } },
    );
    await act(async () => {
      reject("first");
      try {
        await promise;
      } catch {}
    });
    rerender({ promise: secondPromise });
    await act(async () => {
      secondReject("second");
      try {
        await secondPromise;
      } catch {}
    });
    // Assert
    const currentState = result.current;
    expect(currentState).toMatchObject({
      isPending: false,
      hasError: true,
      error: "second",
      hasValue: false,
      source: secondPromise,
    });
  });

  it("ignores first result when second promise finishes first", async () => {
    // Arrange
    const { promise, resolve } = makePromise<string, string>();
    const { promise: secondPromise, resolve: secondResolve } =
      makePromise<string, string>();
    // Act
    const { result, rerender } = renderHook(
      (props) => usePromiseStatus<string, string>(props.promise),
      { initialProps: { promise } },
    );
    rerender({ promise: secondPromise });
    await act(async () => {
      secondResolve("second");
      await secondPromise;
    });
    await act(async () => {
      resolve("first");
      await promise;
    });
    // Assert
    const currentState = result.current;
    expect(currentState).toMatchObject({
      isPending: false,
      hasError: false,
      hasValue: true,
      value: "second",
      source: secondPromise,
    });
  });
});

function makePromise<T, E>() {
  let resolve!: (t: T) => void;
  let reject!: (e: E) => void;
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return { promise, resolve, reject };
}
