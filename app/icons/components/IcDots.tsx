import * as React from "react";
function SvgIcDots(props: React.SVGProps<SVGSVGElement>) {
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
        d="M16.388 11.019a2.292 2.292 0 103.811 2.546 2.292 2.292 0 00-3.811-2.546zm3.188.417a1.543 1.543 0 11-2.707 1.446 1.542 1.542 0 012.707-1.446zM10.388 11.019a2.292 2.292 0 103.811 2.546 2.292 2.292 0 00-3.811-2.546zm3.188.417a1.542 1.542 0 11-2.565 1.713 1.542 1.542 0 012.565-1.713zM4.39 11.018a2.292 2.292 0 103.81 2.547 2.292 2.292 0 00-3.81-2.547zm3.186.417a1.544 1.544 0 01-2.139 2.138 1.54 1.54 0 112.14-2.138z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcDots;
