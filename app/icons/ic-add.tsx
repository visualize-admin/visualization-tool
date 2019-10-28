import * as React from "react";

export const IconAdd = ({ size = 24, color = "currentColor" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    fillRule="evenodd"
    stroke="none"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="13 5 13 11 19 11 19 13 13 13 13 19 11 19 11 13 5 13 5 11 11 11 11 5"></polygon>
  </svg>
);