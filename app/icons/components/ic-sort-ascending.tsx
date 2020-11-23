import * as React from "react";

function SvgIcSortAscending(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <path d="M0 0h24v24H0z" />
        <path d="M13 20h-2V9H8l4-5 4 5h-3z" fill="currentColor" />
      </g>
    </svg>
  );
}

export default SvgIcSortAscending;
