import * as React from "react";
function SvgIcSum(props: React.SVGProps<SVGSVGElement>) {
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
        d="M18 7h-1V4.97H7.108l4.303 6.027-.005.003.034.018L7 19.017v.013h10v-1.997h1V20H6v-1.228l4.263-7.68L6 5.122V4h12v3z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcSum;
