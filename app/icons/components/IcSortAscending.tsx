import React from "react";
function SvgIcSortAscending(props: React.SVGProps<SVGSVGElement>) {
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
        <path fill="currentColor" d="M13 20h-2V9H8l4-5 4 5h-3z" />
      </g>
    </svg>
  );
}
export default SvgIcSortAscending;
