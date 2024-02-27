import * as React from "react";
function SvgIcChartColumn(props: React.SVGProps<SVGSVGElement>) {
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
          d="M6.5 15v6h-4v-6h4zm5-6v12h-4V9h4zm5-5v17h-4V4h4zm5 9v8h-4v-8h4z"
        />
      </g>
    </svg>
  );
}
export default SvgIcChartColumn;
