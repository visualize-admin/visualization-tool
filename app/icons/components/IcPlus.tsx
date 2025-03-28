import * as React from "react";
function SvgIcPlus(props: React.SVGProps<SVGSVGElement>) {
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
        d="M19.266 11.758h-6.789V5h-.75v6.758H5v.75h6.727v6.758h.75v-6.758h6.789v-.75z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcPlus;
