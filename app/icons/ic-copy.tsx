import * as React from "react";

export const IconCopy = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M22 22H6V6h16v16zM20 8H8v12h12V8zM2 14V2h12v4h2V0H0v16h6v-2H2z"
      transform="translate(1 1)"
      fill={color}
      stroke="none"
      strokeWidth={1}
      fillRule="evenodd"
    />
  </svg>
);
