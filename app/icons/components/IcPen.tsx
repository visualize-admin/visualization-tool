import * as React from "react";
function SvgIcPen(props: React.SVGProps<SVGSVGElement>) {
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
        d="M16.892 5L5.577 16.361 5 19.43l3.08-.567L19.398 7.496 16.892 5zm.001 1.063L18.337 7.5l-1.873 1.88-1.448-1.432 1.877-1.886zM5.937 18.492l1.774-.325 8.223-8.258-1.448-1.433-8.217 8.25-.332 1.767z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcPen;
