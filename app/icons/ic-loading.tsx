import * as React from "react";

export const IconLoading = ({ size = 64, color = "currentColor" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    fillRule="evenodd"
    stroke={color}
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <g>
      {/* <circle stroke-opacity="25%" cx="32" cy="32" r="20"></circle> */}
      {/* <path d="M52,32 C52,20.954305 43.045695,12 32,12"></path> */}
      <path d="M32,12 C20.954305,12 12,20.954305 12,32 C12,43.045695 20.954305,52 32,52 C43.045695,52 52,43.045695 52,32"></path>
    </g>
  </svg>
);
