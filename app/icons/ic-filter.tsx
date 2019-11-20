import * as React from "react";

export const IconFilter = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M8 12.414L3.293 7.707A1 1 0 013 7V4a1 1 0 011-1h14a1 1 0 011 1v3a1 1 0 01-.293.707L14 12.414V18a1 1 0 01-1 1H9a1 1 0 01-1-1v-5.586zM17 5H5v1.586l4.707 4.707A1 1 0 0110 12v5h2v-5a1 1 0 01.293-.707L17 6.586V5z"
      transform="translate(1 1)"
      fill={color}
      stroke="none"
      strokeWidth={1}
      fillRule="evenodd"
    />
  </svg>
);
