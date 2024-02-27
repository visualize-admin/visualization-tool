import * as React from "react";
function SvgIcChartArea(props: React.SVGProps<SVGSVGElement>) {
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
          d="M23 13v8H1v-1.5L8 15l7 2.5 8-4.5zm0-9v8l-8 4.5L8 14l-7 4.5v-2l7-7 7 2L23 4z"
        />
      </g>
    </svg>
  );
}
export default SvgIcChartArea;
