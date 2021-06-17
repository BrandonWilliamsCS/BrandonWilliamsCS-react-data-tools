import React from "react";

/**
 * Maintains a boolean toggle (a.k.a. flag or switch) in React state.
 * @param initiallySet the initial value for the toggle state
 * @returns a `Toggle` that represents the current React state
 */
export function useToggle(initiallySet = false): Toggle {
  const [state, setState] = React.useState(initiallySet);
  return {
    state,
    setState,
    flip: () => {
      setState((prevState) => !prevState);
    },
    set: () => {
      setState(true);
    },
    reset: () => {
      setState(false);
    },
  };
}

/** A boolean value paired with operations to modify that value. */
export interface Toggle {
  /** The toggle's current setting of true/on or false/off. */
  state: boolean;
  /** Change the state to the opposite of its current value. */
  flip: () => void;
  /** Directly set the toggle to the specified value. */
  setState: (prevState: boolean) => void;
  /** Set the state to true/on. */
  set: () => void;
  /** Set the state to false/off. */
  reset: () => void;
}
