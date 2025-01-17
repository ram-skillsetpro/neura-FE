import React from "react";

interface PlusIconTypes {
  color?: string;
}

const PlusIcon: React.FC<PlusIconTypes> = ({ color = "#EF4747" }) => {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_1856_14318)">
        <path
          d="M14.25 9.75H9.75V14.25H8.25V9.75H3.75V8.25H8.25V3.75H9.75V8.25H14.25V9.75Z"
          fill={color}
        />
      </g>
      <defs>
        <clipPath id="clip0_1856_14318">
          <rect width={18} height={18} fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default PlusIcon;
