import * as React from "react";
function SvgIcFilter(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M9 13.414L4.293 8.707A1 1 0 014 8V5a1 1 0 011-1h14a1 1 0 011 1v3a1 1 0 01-.293.707L15 13.414V19a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5.586zM18 6H6v1.586l4.707 4.707A1 1 0 0111 13v5h2v-5a1 1 0 01.293-.707L18 7.586V6z"
      />
    </svg>
  );
}
export default SvgIcFilter;
