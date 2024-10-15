import React from "react";

interface IDeleteIcon {
  width?: string;
  height?: string;
}

const DeleteIcon: React.FC<IDeleteIcon> = ({ width = "48px", height = "48px" }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 48 48"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <g id="icon-cross-dark" stroke="none" strokeWidth={1} fill="none" fillRule="evenodd">
        <path
          d="M24,3 C25.1045695,3 26,3.94020203 26,5.1 L26,22 L42.9,22 C44.059798,22 45,22.8954305 45,24 C45,25.1045695 44.059798,26 42.9,26 L25.999,26 L26,42.9 C26,44.059798 25.1045695,45 24,45 C22.8954305,45 22,44.059798 22,42.9 L21.999,26 L5.1,26 C3.94020203,26 3,25.1045695 3,24 C3,22.8954305 3.94020203,22 5.1,22 L22,22 L22,5.1 C22,3.94020203 22.8954305,3 24,3 Z"
          id="Combined-Shape"
          fill="#1F1F1F"
          fillRule="nonzero"
          transform="translate(24, 24) rotate(-315) translate(-24, -24)"
        />
      </g>
    </svg>
  );
};

export default DeleteIcon;
