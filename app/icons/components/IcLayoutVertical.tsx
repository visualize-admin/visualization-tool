import * as React from "react";
function SvgIcLayoutVertical(props: React.SVGProps<SVGSVGElement>) {
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
        d="M3 3h18v5H3V3zm1 1v3h16V4H4zM3 9h18v6H3V9zm1 1v4h16v-4H4zm-1 6h18v5H3v-5zm1 1v3h16v-3H4z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcLayoutVertical;
