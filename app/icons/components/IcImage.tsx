import * as React from "react";
function SvgIcImage(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.105 5.472A2.292 2.292 0 118.65 9.284a2.292 2.292 0 01-2.546-3.812zm.417 3.188A1.544 1.544 0 008.66 6.52a1.542 1.542 0 10-2.138 2.14z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 4v15.2h15.05V4H4zm14.3 14.45H4.75v-4.09l2.156-2.156 2.288 2.287 5.538-5.538 3.569 3.569v5.927zm-9.106-5.02l5.538-5.537 3.569 3.568V4.75H4.75v8.549l2.156-2.155 2.288 2.287z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcImage;
