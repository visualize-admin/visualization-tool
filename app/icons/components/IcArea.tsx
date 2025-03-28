import * as React from "react";
function SvgIcArea(props: React.SVGProps<SVGSVGElement>) {
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
        d="M17 9v6H7v-3.5l3.182-2 3.182 1.25L17 9z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcArea;
