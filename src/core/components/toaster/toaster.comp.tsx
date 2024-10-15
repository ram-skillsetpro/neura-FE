import { FunctionComponent, useEffect, useState } from "react";
import { Id, ToastContainerProps, ToastContent, ToastOptions } from "react-toastify";
import { POPUP_TOAST, TOAST } from "src/const";
import { Toaster as IToaster } from "src/core/models/toaster.model";

export function Toaster(props: ToastContainerProps) {
  const [lazyToast, setLazyToast] = useState<{
    default: FunctionComponent<ToastContainerProps>;
  } | null>(null);
  let toast: (content: ToastContent, options?: ToastOptions) => Id;
  const showToast = (toaster: IToaster) => {
    const { message, ...rest } = toaster;
    toast(message, rest);
  };

  useEffect(() => {
    window.addEventListener(POPUP_TOAST, (e: any) => {
      /* istanbul ignore else */
      if (!lazyToast) {
        import(/* webpackChunkName: "toaster" */ "./toaster-lazy.com").then((module) => {
          setLazyToast(module);
          toast = module.toast;
          showToast(e.detail);
        });
      } else {
        showToast(e.detail);
      }
    });

    /* istanbul ignore next */
    return function () {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      window.removeEventListener(TOAST, () => {});
    };
  }, []);
  if (lazyToast) {
    return <lazyToast.default {...props} />;
  }
  return null;
}
