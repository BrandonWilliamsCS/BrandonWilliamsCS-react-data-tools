import { act, renderHook } from "@testing-library/react-hooks";
import { Subject } from "rxjs";

import { useSubscribableValue, useSubscription } from "./useSubscription";

describe("useSubscription", () => {
  it("subscribes to the provided observable", async () => {
    // Arrange
    const subject = new Subject();
    const observer = jest.fn();
    // Act
    const {} = renderHook(
      ([subject, observer]) => useSubscription(subject, observer),
      { initialProps: [subject, observer] as const },
    );
    // Assert
    expect(subject.observed).toBe(true);
  });
  it("unsubscribes from the provided observable on unmount", async () => {
    // Arrange
    const subject = new Subject();
    const observer = jest.fn();
    // Act
    const { unmount } = renderHook(
      ([subject, observer]) => useSubscription(subject, observer),
      { initialProps: [subject, observer] as const },
    );
    unmount();
    // Assert
    expect(subject.observed).toBe(false);
  });
  it("switches subscription when observable changes", async () => {
    // Arrange
    const subject1 = new Subject();
    const subject2 = new Subject();
    const observer = jest.fn();
    // Act
    const { rerender } = renderHook(
      ([subject, observer]) => useSubscription(subject, observer),
      { initialProps: [subject1, observer] as const },
    );
    rerender([subject2, observer]);
    // Assert
    expect(subject1.observed).toBe(false);
    expect(subject2.observed).toBe(true);
  });
  it("emits to latest observer when observable emits", async () => {
    // Arrange
    const subject = new Subject();
    const observer1 = jest.fn();
    const observer2 = jest.fn();
    // Act
    const { rerender } = renderHook(
      ([subject, observer]) => useSubscription(subject, observer),
      { initialProps: [subject, observer1] as const },
    );
    rerender([subject, observer2]);
    act(() => {
      subject.next(undefined);
    });
    // Assert
    expect(observer1).not.toHaveBeenCalled();
    expect(observer2).toHaveBeenCalled();
  });
  it("emits to observer when latest observable emits", async () => {
    // Arrange
    const subject1 = new Subject();
    const subject2 = new Subject();
    const observer = jest.fn();
    // Act
    const { rerender } = renderHook(
      ([subject, observer]) => useSubscription(subject, observer),
      { initialProps: [subject1, observer] as const },
    );
    rerender([subject2, observer]);
    act(() => {
      subject2.next(undefined);
    });
    // Assert
    expect(observer).toHaveBeenCalled();
  });
  it("doesn't emit to observer when a prior observable emits", async () => {
    // Arrange
    const subject1 = new Subject();
    const subject2 = new Subject();
    const observer = jest.fn();
    // Act
    const { rerender } = renderHook(
      ([subject, observer]) => useSubscription(subject, observer),
      { initialProps: [subject1, observer] as const },
    );
    rerender([subject2, observer]);
    act(() => {
      subject1.next(undefined);
    });
    // Assert
    expect(observer).not.toHaveBeenCalled();
  });
});

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
