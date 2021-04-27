import { act, renderHook } from "@testing-library/react-hooks";

import { useDelayedState } from "./useDelayedState";

describe("useDelayedState", () => {
  it("initially returns a never-resolving promise", async () => {
    // Arrange
    const compute = (param: number) => Promise.resolve(param);
    // Act
    const { result } = renderHook(() => useDelayedState(compute));
    // Assert
    const [statePromise] = result.current;
    const timeoutPromise = delayedPromise(100).then(() => -1);
    const racePromise = Promise.race([statePromise, timeoutPromise]);
    await expect(racePromise).resolves.toBe(-1);
  });
  it("resolves to the result of computation when loaded", async () => {
    // Arrange
    const compute = (param: number) => Promise.resolve(param);
    // Act
    const { result } = renderHook(() => useDelayedState(compute));
    await act(async () => {
      const [, load] = result.current;
      await load(1);
    });
    // Assert
    const [statePromise] = result.current;
    await expect(statePromise).resolves.toBe(1);
  });
  it("resolves to the latest result of computation when loaded again", async () => {
    // Arrange
    const compute = (param: number) => Promise.resolve(param);
    // Act
    const { result } = renderHook(() => useDelayedState(compute));
    await act(async () => {
      const [, load] = result.current;
      await load(1);
    });
    await act(async () => {
      const [, load] = result.current;
      await load(2);
    });
    // Assert
    const [statePromise] = result.current;
    await expect(statePromise).resolves.toBe(2);
  });
});

function delayedPromise(delayinMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayinMs);
  });
}
