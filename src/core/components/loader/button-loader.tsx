import { HTMLAttributes } from "react";

interface ButtonLoaderProps extends HTMLAttributes<HTMLButtonElement> {}
export function ButtonLoader(props: ButtonLoaderProps) {
  const { ...rest } = props;
  return (
    <button
      className="button-dark-gray rounded-12 sm-button tracking-wider font-bold uppercase cursor-pointer ml-3"
      {...rest}
    >
      <div className="loader-insideBtn"></div>
    </button>
  );
}
