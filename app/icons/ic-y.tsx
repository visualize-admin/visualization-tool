import * as React from "react";
export const IconY = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <g stroke="none" strokeWidth={1} fill="none" fillRule="evenodd">
      <path d="M0 0H24V24H0z" />
      <path
        d="M4.414 1l4 4h-3v10h13v2h-15V5h-3l4-4zm8.217 0l1.858 4.612h.03L16.377 1h2.037l-2.891 6.627c-.15.418-.305.826-.465 1.224-.16.408-.354.77-.584 1.09-.22.318-.5.571-.839.76-.36.2-.799.299-1.318.299-.48 0-.954-.07-1.423-.209l.134-1.478c.23.09.575.135 1.034.135.41-.01.73-.14.959-.388.23-.25.345-.577.345-.985L10.414 1h2.217z"
        transform="translate(1.586 3)"
        fill={color}
      />
    </g>
  </svg>
);
