import * as React from "react";
function SvgIcSharedDimension(props: React.SVGProps<SVGSVGElement>) {
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
        d="M10 5h10v10H10v-3h1v2h8V6h-8v2h-1V5zm4 11h-1v2H5v-8h8v2h1V9H4v10h10v-3z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcSharedDimension;
