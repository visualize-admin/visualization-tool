import * as React from "react";
function SvgIcPause(props: React.SVGProps<SVGSVGElement>) {
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
          d="M3 21V3h7.512v18H3zm10.512 0V3H21v18h-7.488z"
        />
      </g>
    </svg>
  );
}
export default SvgIcPause;
