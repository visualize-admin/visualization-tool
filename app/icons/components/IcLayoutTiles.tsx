import * as React from "react";
function SvgIcLayoutTiles(props: React.SVGProps<SVGSVGElement>) {
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
        d="M11 3H2v8h9V3zm11 0h-9v8h9V3zm-9 11h9v8h-9v-8zm-2 0H2v8h9v-8z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcLayoutTiles;
