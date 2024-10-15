import { useEffect, useState } from "react";

/**
 * A custom React hook for reading and writing data to/from the browser's localStorage.
 *
 * @template T
 * @param {string} key - The key under which the data will be stored in localStorage.
 * @param {T} initialValue - The optional initial value to be used if there is no data in
 *   localStorage.
 * @returns {[T, React.Dispatch<React.SetStateAction<T>>, () => void]} An array containing the
 *   current value, a function to update the value in localStorage, and a function to clear the
 *   value from localStorage.
 */
function useLocalStorage<T>(
  key: string,
  initialValue?: T | null,
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {
  // State to hold the current value of the localStorage key
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Attempt to retrieve the value from localStorage
      const item = window.localStorage.getItem(key);

      // Return the parsed JSON value if it exists, or the initialValue if not
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If an error occurs, return the initialValue
      console.error("Error retrieving data from localStorage:", error);
      return initialValue;
    }
  });

  /**
   * Function to update the value in localStorage.
   *
   * @param {T | ((prevValue: T) => T)} value - The value to be set in localStorage. It can also be
   *   a function that receives the current value and returns the new value.
   */
  const setValue = (value: T | ((prevValue: T) => T)) => {
    try {
      // Allow value to be a function to match useState API
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Save the value to localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));

      // Update the state with the new value
      setStoredValue(valueToStore);
    } catch (error) {
      console.error("Error setting data to localStorage:", error);
    }
  };

  /** Function to clear the value from localStorage. */
  const clearValue = () => {
    try {
      // Remove the key from localStorage
      window.localStorage.removeItem(key);

      // Update the state with the initial value
      setStoredValue(initialValue);
    } catch (error) {
      console.error("Error clearing data from localStorage:", error);
    }
  };

  useEffect(() => {
    // Update the state with the latest value from localStorage whenever the key changes
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error("Error updating state from localStorage:", error);
    }
  }, [key]);

  return [storedValue, setValue, clearValue];
}

export default useLocalStorage;
