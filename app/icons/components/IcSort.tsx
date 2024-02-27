import * as React from "react";
function SvgIcSort(props: React.SVGProps<SVGSVGElement>) {
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
          d="M14 17v2h-4v-2h4zm2-4v2H8v-2h8zm2-4v2H6V9h12zm2-4v2H4V5h16z"
        />
      </g>
    </svg>
  );
}
export default SvgIcSort;
