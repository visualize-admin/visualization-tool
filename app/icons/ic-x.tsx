import * as React from "react";

export const IconX = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <g stroke="none" strokeWidth={1} fill="none" fillRule="evenodd">
      <path d="M0 0H24V24H0z" />
      <path
        d="M3.414 2v13h10v-3l4 4-4 4v-3h-12V2h2zm8.747 0l1.333 2.636L14.862 2h2.324l-2.324 3.794L17.414 10h-2.53l-1.538-2.946L11.819 10H9.414l2.576-4.206L9.688 2h2.473z"
        transform="translate(2.586 2)"
        fill={color}
      />
    </g>
  </svg>
);
