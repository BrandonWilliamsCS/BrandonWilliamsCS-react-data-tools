import { act, renderHook } from "@testing-library/react-hooks";
import { Subject } from "rxjs";

import { useSubscribableValue } from "./useSubscribableValue";

describe("useSubscribableValue", () => {
  it("initially returns provided initial value", async () => {
    // Arrange
    const subject = new Subject();
    const initialValue = 3;
    // Act
    const { result } = renderHook(
      ([subject, initialValue]) => useSubscribableValue(subject, initialValue),
      { initialProps: [subject, initialValue] as const },
    );
    // Assert
    expect(result.current).toBe(initialValue);
  });
  it("initially returns undefined given no initial value", async () => {
    // Arrange
    const subject = new Subject();
    // Act
    const { result } = renderHook(() => useSubscribableValue(subject));
    // Assert
    expect(result.current).not.toBeDefined();
  });
  it("returns emitted value after emission", async () => {
    // Arrange
    const subject = new Subject();
    const initialValue = 3;
    const secondaryValue = 3;
    // Act
    const { result } = renderHook(
      ([subject, initialValue]) => useSubscribableValue(subject, initialValue),
      { initialProps: [subject, initialValue] as const },
    );
    act(() => {
      subject.next(secondaryValue);
    });
    // Assert
    expect(result.current).toBe(secondaryValue);
  });
});
