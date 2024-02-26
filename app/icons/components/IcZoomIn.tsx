import * as React from "react";
function SvgIcZoomIn(props: React.SVGProps<SVGSVGElement>) {
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
          d="M11 2a9 9 0 017.032 14.617l3.675 3.676-1.414 1.414-3.676-3.675A9 9 0 1111 2zm0 2a7 7 0 100 14 7 7 0 000-14zm1 4v2h2v2h-2v2h-2v-2H8v-2h2V8h2z"
        />
      </g>
    </svg>
  );
}
export default SvgIcZoomIn;
