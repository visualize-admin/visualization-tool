import * as React from "react";
function SvgIcCursor(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <path d="M0 0h24v24H0z" />
        <path
          fill="currentColor"
          d="M21 8L2 2l5 20 4-7 7 7a2.122 2.122 0 003-3l-7-7 7-4z"
        />
      </g>
    </svg>
  );
}
export default SvgIcCursor;
