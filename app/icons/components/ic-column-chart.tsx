import * as React from "react";

function SvgIcColumnChart(props: React.SVGProps<SVGSVGElement>) {
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
          d="M13 30v12H5V30h8zm10-12v24h-8V18h8zM33 8v34h-8V8h8zm10 18v16h-8V26h8z"
          fill="#069"
        />
      </g>
    </svg>
  );
}

export default SvgIcColumnChart;
