import * as React from "react";

function SvgIcChecked(props: React.SVGProps<SVGSVGElement>) {
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
        d="M2 12c0 5.523 4.477 10 10 10 5.52-.006 9.994-4.48 10-10 0-5.523-4.477-10-10-10S2 6.477 2 12zm4.078.84l1.028-1.138 3.256 2.92 6.402-7.442 1.166.996-7.426 8.633-4.426-3.97z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgIcChecked;
