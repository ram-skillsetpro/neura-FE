import { useState } from "react";

/**
 * A custom hook for managing a modal state.
 *
 * @returns {[boolean, () => void]} A tuple containing a boolean representing the modal state (true
 *   if the modal is showing, false otherwise) and a function to toggle the modal state.
 */
const useModal = (): [boolean, () => void] => {
  const [isShowing, setIsShowing] = useState<boolean>(false);

  /** Toggles the modal state. */
  const toggle = (): void => {
    setIsShowing(!isShowing);
  };

  return [isShowing, toggle];
};

export default useModal;
