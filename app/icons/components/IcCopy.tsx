import * as React from "react";
function SvgIcCopy(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20 9H9v11h11V9zM8 8v13h13V8H8z"
        fill="currentColor"
      />
      <path d="M6 17H4V4h13v2h-1V5H5v11h1v1z" fill="currentColor" />
    </svg>
  );
}
export default SvgIcCopy;
