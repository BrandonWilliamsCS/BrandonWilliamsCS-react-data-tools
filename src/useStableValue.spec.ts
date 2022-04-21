import { renderHook } from "@testing-library/react-hooks";

import { useStableValue } from "./useStableValue";

describe("useStableValue", () => {
  it("preserves the reference on later renders with same dependencies", async () => {
    // Arrange
    let i = 0;
    const computeValue = () => i++;

    // Act
    const { result, rerender } = renderHook(
      (deps) => useStableValue(computeValue, deps),
      { initialProps: [0] },
    );
    rerender([0]);

    // Assert
    expect(result.current).toBe(0);
  });

  it("changes the reference on later renders with new dependencies", async () => {
    // Arrange
    let i = 0;
    const computeValue = () => i++;

    // Act
    const { result, rerender } = renderHook(
      (deps) => useStableValue(computeValue, deps),
      { initialProps: [0] },
    );
    rerender([1]);

    // Assert
    expect(result.current).toBe(1);
  });

  it("runs cleanup on the old value when the value changes", async () => {
    // Arrange
    let i = 0;
    const computeValue = () => i++;
    const cleanup = jest.fn();

    // Act
    const { result, rerender } = renderHook(
      (deps) => useStableValue(computeValue, deps, cleanup),
      { initialProps: [0] },
    );
    rerender([1]);

    // Assert
    expect(cleanup).toHaveBeenCalledWith(0);
  });

  it("does not run cleanup when value remains unchanged", async () => {
    // Arrange
    let i = 0;
    const computeValue = () => i++;
    const cleanup = jest.fn();

    // Act
    const { result, rerender } = renderHook(
      (deps) => useStableValue(computeValue, deps, cleanup),
      { initialProps: [0] },
    );
    rerender([0]);

    // Assert
    expect(cleanup).not.toHaveBeenCalled();
  });

  it("runs cleanup on the final value after unmount", async () => {
    // Arrange
    let i = 0;
    const computeValue = () => i++;
    const cleanup = jest.fn();

    // Act
    const { unmount } = renderHook(
      (deps) => useStableValue(computeValue, deps, cleanup),
      { initialProps: [0] },
    );
    unmount();

    // Assert
    expect(cleanup).toHaveBeenCalledWith(0);
  });
});
