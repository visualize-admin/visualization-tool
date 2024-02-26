import * as React from "react";
function SvgIcChartPie(props: React.SVGProps<SVGSVGElement>) {
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
          d="M17.731 5.002c3.11 2.419 4.127 6.487 2.605 10.205l-.158.293-7.678-4 5.231-6.498zM12.5 3a9.165 9.165 0 013.674.98c.197.102.39.21.576.325L12.5 9.75V3zm-1 0v9l8 4.5c-1.577 2.805-4.483 4.5-7.637 4.5a8.887 8.887 0 01-4.11-1.01C5.66 18.872 4.12 16.978 3.41 14.687a9.074 9.074 0 01.602-6.871c1.406-2.721 4.07-4.525 7.044-4.8L11.5 3z"
        />
      </g>
    </svg>
  );
}
export default SvgIcChartPie;
