import * as React from "react";
function SvgIcSegments(props: React.SVGProps<SVGSVGElement>) {
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
        d="M8 17c1.27 0 2.43-.474 3.312-1.255A5.975 5.975 0 0110 12c0-1.417.491-2.719 1.312-3.745A5 5 0 108 17zm0 1a5.978 5.978 0 004-1.528 6 6 0 100-8.944A6 6 0 108 18zm8-11c-1.27 0-2.43.474-3.312 1.255A5.975 5.975 0 0114 12a5.975 5.975 0 01-1.312 3.745A5 5 0 1016 7z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcSegments;
