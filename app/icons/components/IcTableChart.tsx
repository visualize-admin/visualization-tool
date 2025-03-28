import * as React from "react";
function SvgIcTableChart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22 6H2V5h20v1zM7 9H2v1h5V9zm0 4H2v1h5v-1zm0 4H2v1h5v-1zm8-8h-5v1h5V9zm0 4h-5v1h5v-1zm0 4h-5v1h5v-1zm7-8h-5v1h5V9zm0 4h-5v1h5v-1zm0 4h-5v1h5v-1z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcTableChart;
