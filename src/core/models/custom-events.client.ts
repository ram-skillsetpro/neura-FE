import { POPUP_TOAST, TOAST } from "src/const";
import { Toaster } from "./toaster.model";

export function ToastEvent(options: Toaster) {
  return new CustomEvent<Toaster>(TOAST, { detail: options });
}

export function PopupToastEvent(options: Toaster) {
  return new CustomEvent<Toaster>(POPUP_TOAST, { detail: options });
}
