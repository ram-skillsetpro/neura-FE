import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A custom React hook that enhances the `useState` hook by providing a callback function that gets
 * executed after the state update is completed.
 *
 * @template T - The type of the state value
 * @param {T} initialState - The initial state value
 * @returns {[T, (state: T, cb?: (state: T) => void) => void]} - A tuple containing the state value
 *   and a function to update the state with an optional callback.
 */

export function useStateCallback<T>(
  initialState: T,
): [T, (state: T, cb?: (state: T) => void) => void] {
  const [state, setState] = useState(initialState);
  const cbRef = useRef<((state: T) => void) | undefined>(undefined); // init mutable ref container for callbacks

  /**
   * Update the state with an optional callback that will be executed after the state update is
   * completed.
   *
   * @param {T} state - The new state value
   * @param {(state: T) => void} [cb] - An optional callback function to be executed after the
   *   state update
   */
  const setStateCallback = useCallback((state: T, cb?: (state: T) => void) => {
    cbRef.current = cb; // store current, passed callback in ref
    setState(state);
  }, []); // keep object reference stable, exactly like `useState`

  useEffect(() => {
    // cb.current is `undefined` on initial render,
    // so we only invoke callback on state *updates*
    if (cbRef.current) {
      cbRef.current(state);
      cbRef.current = undefined; // reset callback after execution
    }
  }, [state]);

  return [state, setStateCallback];
}
