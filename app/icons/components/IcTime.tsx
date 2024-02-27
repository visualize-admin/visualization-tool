import * as React from "react";
function SvgIcTime(props: React.SVGProps<SVGSVGElement>) {
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
          d="M17 13v2H7v-2h10zm2-8c1.103 0 2 .897 2 2v12c0 1.103-.897 2-2 2H5c-1.103 0-2-.897-2-2V7c0-1.103.897-2 2-2h2V3h2v2h6V3h2v2h2zM5 19h14.002l-.001-8H5v8zM5 9h14V7H5v2z"
        />
      </g>
    </svg>
  );
}
export default SvgIcTime;
