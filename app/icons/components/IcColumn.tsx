import * as React from "react";
function SvgIcColumn(props: React.SVGProps<SVGSVGElement>) {
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
        d="M15.313 5H20v14h-4.688V5zm-.948-1H21v16H3V4h11.365zm-4.74 1h4.74v14h-4.74V5zm-.947 0H4v14h4.678V5z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcColumn;
