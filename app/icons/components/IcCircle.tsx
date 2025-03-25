import * as React from "react";
function SvgIcCircle(props: React.SVGProps<SVGSVGElement>) {
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
        d="M12.292 4a8.292 8.292 0 108.291 8.292A8.301 8.301 0 0012.293 4z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcCircle;
