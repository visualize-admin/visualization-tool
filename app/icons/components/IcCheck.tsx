import React from "react";
function SvgIcCheck(props: React.SVGProps<SVGSVGElement>) {
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
        <path fill="currentColor" d="M10 17.5L4.5 12 6 10.5l4 4 8-8L19.5 8z" />
      </g>
    </svg>
  );
}
export default SvgIcCheck;
