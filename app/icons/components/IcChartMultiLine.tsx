import * as React from "react";
function SvgIcChartMultiLine(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      {...props}
    >
      <filter id="grayscale">
        <feColorMatrix
          type="matrix"
          values="0.3333 0.3333 0.3333 0 0
    0.3333 0.3333 0.3333 0 0
    0.3333 0.3333 0.3333 0 0
    0 0 0 1 0"
        />
      </filter>
      <g fillRule="evenodd">
        <path
          d="M23.003 12.848l-1.452-1.405-6.465 6.249-5.526-5.34-1.453 1.403 6.979 6.745zM3.785 9.574l1.416 1.368 1.453-1.404-2.869-2.772-2.781 2.688 1.453 1.404 1.328-1.284z"
          fill="currentColor"
          filter="url(#grayscale)"
        />
        <path
          d="M10.463 10.074l-8.006 7.738-1.453-1.404 9.459-9.142 3.596 3.475L21.55 3.5l1.453 1.404-8.945 8.646z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}
export default SvgIcChartMultiLine;
