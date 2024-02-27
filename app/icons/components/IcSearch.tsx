import * as React from "react";
function SvgIcSearch(props: React.SVGProps<SVGSVGElement>) {
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
          d="M10.5 2a8.5 8.5 0 016.714 13.714L22 20.5 20.5 22l-4.787-4.786A8.5 8.5 0 1110.5 2zm0 2a6.5 6.5 0 100 13 6.5 6.5 0 000-13z"
        />
      </g>
    </svg>
  );
}
export default SvgIcSearch;
