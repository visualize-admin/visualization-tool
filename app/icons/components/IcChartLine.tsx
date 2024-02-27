import * as React from "react";
function SvgIcChartLine(props: React.SVGProps<SVGSVGElement>) {
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
          d="M21.293 11.293l1.414 1.414L15 20.414l-6.793-6.793 1.414-1.414L15 17.586l6.293-6.293zm0-8l1.414 1.414L14 13.414l-3.5-3.5-7.793 7.793-1.414-1.414L10.5 7.086l3.5 3.5 7.293-7.293zM4 6.586l2.792 2.792-1.414 1.414L4 9.414l-1.293 1.293-1.414-1.414L4 6.586z"
        />
      </g>
    </svg>
  );
}
export default SvgIcChartLine;
