import * as React from "react";
function SvgIcPin(props: React.SVGProps<SVGSVGElement>) {
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
        d="M7.217 20.533l-.65-.375 2.549-4.414L5 13.368l.188-.325a3.788 3.788 0 013.341-1.881l2.613-4.524a2.368 2.368 0 01.023-2.313L11.353 4l7.435 4.293-.188.325a2.368 2.368 0 01-1.99 1.176l-2.612 4.524a3.782 3.782 0 01.04 3.836l-.187.325-4.086-2.36-2.548 4.414z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcPin;
