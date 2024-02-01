import * as React from "react";

function SvgIcLayoutDashboard(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1m"
      {...props}
    >
      <path
        fill="currentColor"
        fill-rule="evenodd"
        d="M11 2H2V14H11V2ZM22 2H13V8H22V2ZM13 10H22V22H13V10ZM11 16H2V22H11V16Z"
      />
    </svg>
  );
}

export default SvgIcLayoutDashboard;
