import * as React from "react";
function SvgIcUnderlined(props: React.SVGProps<SVGSVGElement>) {
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
        d="M6 18.984h12V20H6v-1.016zM16.21 4h-1.214v8.21c0 2.12-1.092 3.336-2.996 3.336-1.887 0-3.014-1.247-3.014-3.336V4H7.789v8.264c0 2.694 1.653 4.434 4.21 4.434 2.559 0 4.211-1.74 4.211-4.434V4z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcUnderlined;
