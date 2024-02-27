import * as React from "react";
function SvgIcSortValueAsc(props: React.SVGProps<SVGSVGElement>) {
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
          d="M20 5v15h-4V5h4zm-6 8v7h-4v-7h4zm-6 2v5H4v-5h4zm2-11l5 4-5 4V9H4V7h6V4z"
        />
      </g>
    </svg>
  );
}
export default SvgIcSortValueAsc;
