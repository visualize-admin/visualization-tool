import * as React from "react";
function SvgIcArrowUp(props: React.SVGProps<SVGSVGElement>) {
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
        d="M19 7.999L12 4 5 7.999l.373.639 6.254-3.573V20h.746V5.065l6.254 3.573.373-.64z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcArrowUp;
