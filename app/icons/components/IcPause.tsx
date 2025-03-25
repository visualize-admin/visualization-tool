import * as React from "react";
function SvgIcPause(props: React.SVGProps<SVGSVGElement>) {
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
        d="M11 20H5V4h6v16zm-5-1h4V5H6v14zm13 1h-6V4h6v16zm-5-1h4V5h-4v14z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcPause;
