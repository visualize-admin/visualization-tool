import * as React from "react";
function SvgIcRightAligned(props: React.SVGProps<SVGSVGElement>) {
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
          d="M20 17v2H4v-2h16zm0-4v2H9v-2h11zm0-4v2H4V9h16zm0-4v2H9V5h11z"
        />
      </g>
    </svg>
  );
}
export default SvgIcRightAligned;
