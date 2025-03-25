import * as React from "react";
function SvgIcDescription(props: React.SVGProps<SVGSVGElement>) {
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
        d="M4 6h11v1H4V6zm0 4h16V9H4v1zm0 3h16v-1H4v1zm0 6h16v-1H4v1zm0-3h16v-1H4v1z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcDescription;
