import * as React from "react";
function SvgIcChartColumn(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M4.75 17.393V5H4v13.143h16.209v-.75H4.75z" fill="currentColor" />
      <path
        d="M7.313 13.313h.75v3.186h-.75v-3.186zM9.602 11.383h.75v5.115h-.75v-5.115zM11.89 9.469h.75V16.5h-.75V9.469zM14.18 12.117h.75v4.385h-.75v-4.385zM16.469 10.125h.75v6.373h-.75v-6.373z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcChartColumn;
