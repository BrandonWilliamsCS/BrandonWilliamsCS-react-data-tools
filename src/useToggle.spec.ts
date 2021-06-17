import { act, renderHook } from "@testing-library/react-hooks";

import { useToggle } from "./useToggle";

describe("useToggle", () => {
  it("initially returns a false/off state", () => {
    // Act
    const { result } = renderHook(() => useToggle());
    // Assert
    const { state } = result.current;
    expect(state).toBe(false);
  });
  it("initially returns a true/on state if instructed", () => {
    // Act
    const { result } = renderHook(() => useToggle(true));
    // Assert
    const { state } = result.current;
    expect(state).toBe(true);
  });
  describe("setState", () => {
    it("changes the state to the provided value", () => {
      // Act
      const { result } = renderHook(() => useToggle());
      act(() => {
        const { setState } = result.current;
        setState(true);
      });
      // Assert
      const { state } = result.current;
      expect(state).toBe(true);
    });
    it("accounts for rapid, consecutive state changes", () => {
      // Act
      const { result } = renderHook(() => useToggle());
      act(() => {
        const { setState } = result.current;
        setState(true);
        setState(false);
      });
      // Assert
      const { state } = result.current;
      expect(state).toBe(false);
    });
  });
  describe("flip", () => {
    it("flips the state to its opposite", () => {
      // Act
      const { result } = renderHook(() => useToggle());
      act(() => {
        const { flip } = result.current;
        flip();
      });
      // Assert
      const { state } = result.current;
      expect(state).toBe(true);
    });
    it("accounts for rapid, consecutive flips", () => {
      // Act
      const { result } = renderHook(() => useToggle());
      act(() => {
        const { flip } = result.current;
        flip();
        flip();
      });
      // Assert
      const { state } = result.current;
      expect(state).toBe(false);
    });
  });
  describe("set", () => {
    it("sets the state to true/on", () => {
      // Act
      const { result } = renderHook(() => useToggle());
      act(() => {
        const { set } = result.current;
        set();
      });
      // Assert
      const { state } = result.current;
      expect(state).toBe(true);
    });
  });
  describe("reset", () => {
    it("sets the state to false/off", () => {
      // Act
      const { result } = renderHook(() => useToggle(true));
      act(() => {
        const { reset } = result.current;
        reset();
      });
      // Assert
      const { state } = result.current;
      expect(state).toBe(false);
    });
  });
});
