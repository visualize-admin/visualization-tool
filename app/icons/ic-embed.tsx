import * as React from "react";

export const IconEmbed = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M12.275.788l1.94.485-4.489 17.94-1.94-.485L12.275.788zM5 4.586L6.414 6l-4 4 4 4L5 15.414.293 10.707a.999.999 0 010-1.414L5 4.586zm12 0l4.707 4.707a.999.999 0 010 1.414L17 15.414 15.586 14l4-4-4-4L17 4.586z"
      transform="translate(1 2)"
      fill={color}
      stroke="none"
      strokeWidth={1}
      fillRule="evenodd"
    />
  </svg>
);
