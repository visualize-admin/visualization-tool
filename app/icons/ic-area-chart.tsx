import * as React from "react";

export const IconAreaChart = ({ size = 48, color = "currentColor" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill={color}
    fillRule="evenodd"
    stroke="none"
  >
    <g transform="translate(2.000000, 8.000000)">
      {/* <g opacity="1.0" transform="translate(0.000000, 36.000000)">
        <rect x="0" y="0" width="44" height="2"></rect>
      </g> */}
      <path d="M44,18 L44,34 L0,34 L0,31 L14,22 L28,27 L44,18 Z M44,0 L44,16 L28,25 L14,20 L0,29 L0,25 L14,11 L28,15 L44,0 Z"></path>
    </g>
  </svg>
);