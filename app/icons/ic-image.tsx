import * as React from "react";

export const IconImage = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <g stroke="none" strokeWidth={1} fill="none" fillRule="evenodd">
      <path d="M0 0H24V24H0z" />
      <path
        d="M22 2v20H2V2h20zm-2 2H4v16h.584L16 8.586l4 3.999V4zm-4 7.414L7.414 20H20v-4.585l-4-4zM8.5 6a2.5 2.5 0 110 5 2.5 2.5 0 010-5zm0 2a.5.5 0 100 1 .5.5 0 000-1z"
        fill={color}
      />
    </g>
  </svg>
);
