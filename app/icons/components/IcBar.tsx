import * as React from "react";
function SvgIcBar(props: React.SVGProps<SVGSVGElement>) {
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
        d="M16 16H8V8h8v8z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcBar;
