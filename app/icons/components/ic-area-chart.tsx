import * as React from "react";

function SvgIcAreaChart(props: React.SVGProps<SVGSVGElement>) {
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
          d="M46 26v16H2v-3l14-9 14 5 16-9zm0-18v16l-16 9-14-5-14 9v-4l14-14 14 4L46 8z"
          fill="#069"
        />
      </g>
    </svg>
  );
}

export default SvgIcAreaChart;
