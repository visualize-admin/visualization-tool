import React from "react";
function SvgIcMinus(props: React.SVGProps<SVGSVGElement>) {
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
        <path fill="currentColor" d="M19 11v2H5v-2z" />
      </g>
    </svg>
  );
}
export default SvgIcMinus;
