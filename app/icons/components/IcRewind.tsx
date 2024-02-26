import * as React from "react";
function SvgIcRewind(props: React.SVGProps<SVGSVGElement>) {
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
          d="M4 12l8.256-8.256v7.512l7.488-7.512v16.512l-7.488-7.512v7.512z"
        />
      </g>
    </svg>
  );
}
export default SvgIcRewind;
