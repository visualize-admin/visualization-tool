import * as React from "react";

export const IconChevronRight = ({ size = 24, color = "currentColor" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    fillRule="evenodd"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="butt"
    strokeLinejoin="inherit"
  >
    <polyline points="9 6 15 12 9 18"></polyline>
  </svg>
);