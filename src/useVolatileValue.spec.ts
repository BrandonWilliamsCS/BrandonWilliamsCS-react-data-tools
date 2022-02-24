import { renderHook } from "@testing-library/react-hooks";

import { useVolatileValue } from "./useVolatileValue";

describe("useVolatileValue", () => {
  it("Returns the initial value, initially", async () => {
    // Arrange
    // Act
    const { result, rerender } = renderHook(
      (value) => useVolatileValue(value),
      { initialProps: 0 },
    );
    // Assert
    expect(result.current.current).toBe(0);
  });
  it("Updates the value on re-render", async () => {
    // Arrange
    // Act
    const { result, rerender } = renderHook(
      (value) => useVolatileValue(value),
      { initialProps: 0 },
    );
    rerender(1);

    // Assert
    expect(result.current.current).toBe(1);
  });
});
