import * as React from "react";
function SvgIcMapRegions(props: React.SVGProps<SVGSVGElement>) {
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
        d="M21 11h-8V3h8v8zm-7-1h6V4h-6v6zm7 11h-8v-8h8v8zm-7-1h6v-6h-6v6zm-3 1H3v-8h8v8zm-7-1h6v-6H4v6zM3 3v8h8V3H3z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcMapRegions;
