import * as React from "react";

function SvgIcLineChart(props: React.SVGProps<SVGSVGElement>) {
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
          d="M42.586 22.586l2.828 2.828L30 40.828 16.415 27.243l2.828-2.828L30 35.172l12.586-12.586zm0-16l2.828 2.828L28 26.828l-7-7L5.414 35.414l-2.828-2.828L21 14.172l7 7L42.586 6.586zM8 13.172l5.585 5.585-2.828 2.828L8 18.828l-2.586 2.586-2.828-2.828L8 13.172z"
          fill="#069"
        />
      </g>
    </svg>
  );
}

export default SvgIcLineChart;
