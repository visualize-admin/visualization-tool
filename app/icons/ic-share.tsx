import * as React from "react";

export const IconShare = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M10 3v2H2v13h13v-8h2v10H0V3h10zm10-3v8h-2V3.414l-10 10L6.586 12l10-10H12V0h8z"
      transform="translate(2 2)"
      fill={color}
      stroke="none"
      strokeWidth={1}
      fillRule="evenodd"
    />
  </svg>
);
