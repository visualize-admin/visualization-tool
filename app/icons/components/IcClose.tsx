import * as React from "react";
function SvgIcClose(props: React.SVGProps<SVGSVGElement>) {
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
        d="M16 6.5L17.414 8 13.5 12l4 4-1.5 1.5-4-4-4 4L6.5 16l4-4-4-4L8 6.5l4 4z"
      />
    </svg>
  );
}
export default SvgIcClose;
