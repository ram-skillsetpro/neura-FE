import { ACCESS_TOKEN, REFRESH_TOKEN } from "src/const";
import { PopupToastEvent, ToastEvent } from "../models/custom-events.client";
import { Toaster } from "../models/toaster.model";

export class CommonService {
  public static toast(toaster: Toaster) {
    if (!process.env.IS_SERVER) {
      const id = setInterval(() => {
        const el = document.querySelector(".notification-stack");
        if (el) {
          clearInterval(id);
          window.dispatchEvent(ToastEvent(toaster));
        }
      }, 200);
    }
  }

  public static popupToast(toaster: Toaster) {
    if (!process.env.IS_SERVER) {
      window.dispatchEvent(PopupToastEvent(toaster));
    }
  }

  public static logout() {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
  }
}
