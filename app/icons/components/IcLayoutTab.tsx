import * as React from "react";
function SvgIcLayoutTab(props: React.SVGProps<SVGSVGElement>) {
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
        d="M3 3h5v3H3V3zm1 1v1h3V4H4zM3 7h18v14H3V7zm1 1v12h16V8H4zm5-5h6v3H9V3zm1 1v1h4V4h-4zm6-1h5v3h-5V3zm1 1v1h3V4h-3z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcLayoutTab;
