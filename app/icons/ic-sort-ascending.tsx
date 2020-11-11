import * as React from "react";

export const IconSortAscending = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <g fill="none" fillRule="evenodd">
      <path d="M0 0h24v24H0z" />
      <path fill={color} d="M13 20h-2V9H8l4-5 4 5h-3z" />
    </g>
  </svg>
);
