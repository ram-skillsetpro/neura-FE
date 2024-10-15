import React, { useEffect, useRef } from "react";
import { TOAST } from "src/const";
import "src/core/components/notification/notification-stack.scss";
import { generateRandomCode } from "src/core/utils";

interface NotificationStackTypes {}

const NotificationStack: React.FC<NotificationStackTypes> = () => {
  const id = useRef<string>(`notification-container-${generateRandomCode(20)}`);
  const pushNotification = (params: any) => {
    const { message, title = "Notification", type = "success", timeout = 5000 } = params;
    const notificationEl = document.querySelector(`.${id.current}`);

    // eslint-disable-next-line max-len
    const htmlString = `<div class="toast ${
      type === "success" ? "t-success" : "t-error"
    }" style="z-index: 9999">
      <div class="fs11 font-bold mb-1">
        <span class="${type === "success" ? "dot-g" : "dot-w"} mr-2-5 inline-block"></span>
        ${title}
      </div>
      <div class="toast-body">
         <p>${message}</p>
      </div>
      </a>
    </div>`;
    const el = document.createElement("div");
    const clonedEl: any = el.cloneNode(true);

    clonedEl.innerHTML = htmlString;
    notificationEl && notificationEl.prepend(clonedEl);

    setTimeout(() => {
      clonedEl.classList.add("animated-element");
      setTimeout(() => {
        notificationEl && notificationEl.removeChild(clonedEl);
      }, 900);
    }, timeout);
  };

  useEffect(() => {
    window.addEventListener(TOAST, (e) => {
      const { message, title, type, timeout } = e.detail || {};
      pushNotification({
        title,
        message,
        type,
        timeout,
      });
    });

    /* istanbul ignore next */
    return function () {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      window.removeEventListener(TOAST, () => {});
    };
  }, []);
  return <div className={`${id.current} notification-stack`}></div>;
};

export default NotificationStack;
