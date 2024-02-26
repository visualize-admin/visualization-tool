import * as React from "react";
function SvgIcSortValueDesc(props: React.SVGProps<SVGSVGElement>) {
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
          d="M8 5v15H4V5h4zm6 8v7h-4v-7h4zm6 2v5h-4v-5h4zM16 4l5 4-5 4V9h-6V7h6V4z"
        />
      </g>
    </svg>
  );
}
export default SvgIcSortValueDesc;
