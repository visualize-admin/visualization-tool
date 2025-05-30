import * as React from "react";
function SvgIcDragIndicator(props: React.SVGProps<SVGSVGElement>) {
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
        d="M7.292 4a2.292 2.292 0 100 4.584 2.292 2.292 0 000-4.584zm0 3.833a1.542 1.542 0 110-3.083 1.542 1.542 0 010 3.083zM7.292 10a2.291 2.291 0 100 4.582 2.291 2.291 0 000-4.582zm0 3.834a1.542 1.542 0 110-3.085 1.542 1.542 0 010 3.085zM7.292 16a2.292 2.292 0 100 4.583 2.292 2.292 0 000-4.583zm0 3.834a1.542 1.542 0 110-3.083 1.542 1.542 0 010 3.083zM16.23 8.584A2.292 2.292 0 1016.229 4a2.292 2.292 0 000 4.584zm0-3.834a1.542 1.542 0 11-.001 3.084 1.542 1.542 0 010-3.084zM16.23 10a2.292 2.292 0 10-.001 4.583 2.292 2.292 0 000-4.583zm0 3.834a1.542 1.542 0 110-3.085 1.542 1.542 0 010 3.085zM16.23 16a2.292 2.292 0 10-.001 4.584A2.292 2.292 0 0016.23 16zm0 3.834a1.542 1.542 0 110-3.085 1.542 1.542 0 010 3.085z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcDragIndicator;
