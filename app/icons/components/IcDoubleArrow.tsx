import * as React from "react";
function SvgIcDoubleArrow(props: React.SVGProps<SVGSVGElement>) {
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
        d="M10.293 12L5 17.5 6.5 19l6.5-7-6.5-7L5 6.5l5.293 5.5z"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M16.293 12L11 17.5l1.5 1.5 6.5-7-6.5-7L11 6.5l5.293 5.5z"
      />
    </svg>
  );
}
export default SvgIcDoubleArrow;
