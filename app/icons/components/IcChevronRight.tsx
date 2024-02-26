import * as React from "react";
function SvgIcChevronRight(props: React.SVGProps<SVGSVGElement>) {
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
          d="M13.293 12L8 17.5 9.5 19l6.5-7-6.5-7L8 6.5z"
        />
      </g>
    </svg>
  );
}
export default SvgIcChevronRight;
