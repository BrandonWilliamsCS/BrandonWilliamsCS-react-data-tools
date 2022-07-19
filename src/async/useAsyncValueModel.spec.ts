import { initialStatus } from "@brandonwilliamscs/data-tools/async/AsyncStatus";
import { act, renderHook } from "@testing-library/react-hooks";

import { makeTestAsyncValueModel } from "../testUtility/makeTestAsyncValueModel";
import { useAsyncValueModel } from "./useAsyncValueModel";

describe("useAsyncValueModel", () => {
  it("returns pending state immediately when not told to wait for demand", async () => {
    // Arrange
    const { valueModel } = makeTestAsyncValueModel<string, string>();
    // Act
    const { result } = renderHook(() => useAsyncValueModel<string>(valueModel));
    // Assert
    const currentState = result.current;
    expect(currentState).toEqual({
      isPending: true,
      hasError: false,
      hasValue: false,
    });
  });

  it("returns an initial status before the first promise when told to wait for demand", async () => {
    // Arrange
    const { valueModel } = makeTestAsyncValueModel<string, string>(true);
    // Act
    const { result } = renderHook(() => useAsyncValueModel<string>(valueModel));
    // Assert
    const currentState = result.current;
    expect(currentState).toBe(initialStatus);
  });

  it("returns pending state during the first promise", async () => {
    // Arrange
    const { valueModel } = makeTestAsyncValueModel<string, string>();
    // Act
    const { result } = renderHook(() => useAsyncValueModel<string>(valueModel));
    // Assert
    const currentState = result.current;
    expect(currentState).toMatchObject({
      isPending: true,
      hasError: false,
      hasValue: false,
    });
  });

  it("returns a rest state with a result after a successful first promise", async () => {
    // Arrange
    const { valueModel, promiseSets } = makeTestAsyncValueModel<
      string,
      string
    >();
    // Act
    const { result } = renderHook(() => useAsyncValueModel<string>(valueModel));
    await act(async () => {
      promiseSets[0].resolve("first");
      await promiseSets[0].promise;
    });
    // Assert
    const currentState = result.current;
    expect(currentState).toMatchObject({
      isPending: false,
      hasError: false,
      hasValue: true,
      value: "first",
    });
  });

  it("returns a rest state with an error after a failed first promise", async () => {
    // Arrange
    const { valueModel, promiseSets } = makeTestAsyncValueModel<
      string,
      string
    >();
    // Act
    const { result } = renderHook(() => useAsyncValueModel<string>(valueModel));
    await act(async () => {
      promiseSets[0].reject("first");
      try {
        await promiseSets[0].promise;
      } catch {}
    });
    // Assert
    const currentState = result.current;
    expect(currentState).toMatchObject({
      isPending: false,
      hasError: true,
      error: "first",
      hasValue: false,
    });
  });

  it("returns a processing state with a result during a second promise after a successful first call", async () => {
    // Arrange
    const { valueModel, promiseSets } = makeTestAsyncValueModel<
      string,
      string
    >();
    // Act
    const { result } = renderHook(() => useAsyncValueModel<string>(valueModel));
    await act(async () => {
      promiseSets[0].resolve("first");
      await promiseSets[0].promise;
      valueModel.reload();
    });
    // Assert
    const currentState = result.current;
    expect(currentState).toMatchObject({
      isPending: true,
      hasError: false,
      hasValue: true,
      value: "first",
    });
  });

  it("returns a rest state with second result after two successful promises", async () => {
    // Arrange
    const { valueModel, promiseSets } = makeTestAsyncValueModel<
      string,
      string
    >();
    // Act
    const { result } = renderHook(
      (props) => useAsyncValueModel<string>(props.valueModel),
      { initialProps: { valueModel } },
    );
    await act(async () => {
      promiseSets[0].resolve("first");
      await promiseSets[0].promise;
      valueModel.reload();
      promiseSets[1].resolve("second");
      await promiseSets[1].promise;
    });
    // Assert
    const currentState = result.current;
    expect(currentState).toMatchObject({
      isPending: false,
      hasError: false,
      hasValue: true,
      value: "second",
    });
  });

  it("returns a processing state with no error during a second promise after a failed first call", async () => {
    // Arrange
    const { valueModel, promiseSets } = makeTestAsyncValueModel<
      string,
      string
    >();
    // Act
    const { result } = renderHook(
      (props) => useAsyncValueModel<string>(props.valueModel),
      { initialProps: { valueModel } },
    );
    await act(async () => {
      promiseSets[0].reject("first");
      try {
        await promiseSets[0].promise;
      } catch {}
      valueModel.reload();
    });
    // Assert
    const currentState = result.current;
    expect(currentState).toMatchObject({
      isPending: true,
      hasError: false,
      hasValue: false,
    });
  });

  it("returns a rest state with second error after two failed promises", async () => {
    // Arrange
    const { valueModel, promiseSets } = makeTestAsyncValueModel<
      string,
      string
    >();
    // Act
    const { result } = renderHook(
      (props) => useAsyncValueModel<string>(props.valueModel),
      { initialProps: { valueModel } },
    );
    await act(async () => {
      promiseSets[0].reject("first");
      try {
        await promiseSets[0].promise;
      } catch {}
      valueModel.reload();
      promiseSets[1].reject("second");
      try {
        await promiseSets[1].promise;
      } catch {}
    });
    // Assert
    const currentState = result.current;
    expect(currentState).toMatchObject({
      isPending: false,
      hasError: true,
      error: "second",
      hasValue: false,
    });
  });

  it("ignores first result when second promise finishes first", async () => {
    // Arrange
    const { valueModel, promiseSets } = makeTestAsyncValueModel<
      string,
      string
    >();
    // Act
    const { result } = renderHook(
      (props) => useAsyncValueModel<string>(props.valueModel),
      { initialProps: { valueModel } },
    );
    await act(async () => {
      valueModel.reload();
      promiseSets[1].resolve("second");
      await promiseSets[1].promise;
      promiseSets[0].resolve("first");
      await promiseSets[0].promise;
    });
    // Assert
    const currentState = result.current;
    expect(currentState).toMatchObject({
      isPending: false,
      hasError: false,
      hasValue: true,
      value: "second",
    });
  });

  it("abstains from setState when component unmounts before resolution", async () => {
    // Arrange
    let spiedConsoleError = jest.spyOn(global.console, "error");
    const { valueModel, promiseSets } = makeTestAsyncValueModel<
      string,
      string
    >();
    // Act
    const { result, unmount } = renderHook(
      (props) => useAsyncValueModel<string>(props.valueModel),
      { initialProps: { valueModel } },
    );
    unmount();
    await act(async () => {
      promiseSets[0].resolve("first");
      await promiseSets[0].promise;
    });
    // Assert
    // React produces a console error after post-unmount setStates.
    expect(spiedConsoleError).not.toHaveBeenCalled();
    spiedConsoleError.mockReset();
    spiedConsoleError.mockRestore();
  });
});
