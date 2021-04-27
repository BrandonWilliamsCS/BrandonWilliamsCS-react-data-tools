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
});
