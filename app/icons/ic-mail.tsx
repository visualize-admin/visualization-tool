import * as React from "react";

export const IconMail = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M21 0a3 3 0 013 3v14a3 3 0 01-3 3H3a3 3 0 01-3-3V3a3 3 0 013-3h18zm1 3.344l-10 9.001-10-9V17a1 1 0 001 1h18a1 1 0 001-1V3.344zM20.504 2H3.495L12 9.655 20.504 2z"
      transform="translate(0 2)"
      fill={color}
      stroke="none"
      strokeWidth={1}
      fillRule="evenodd"
    />
  </svg>
);
