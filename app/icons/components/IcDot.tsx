import * as React from "react";
function SvgIcDot(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M12 8a4 4 0 110 8 4 4 0 010-8z" fill="currentColor" />
    </svg>
  );
}
export default SvgIcDot;
