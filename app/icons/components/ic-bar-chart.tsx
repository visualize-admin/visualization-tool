import * as React from "react";

function SvgIcBarChart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <path d="M0 0h48v48H0z" />
        <path
          d="M26 35v8H6v-8h20zm14-10v8H6v-8h34zm-8-10v8H6v-8h26zM20 5v8H6V5h14z"
          fill="#069"
        />
      </g>
    </svg>
  );
}

export default SvgIcBarChart;
