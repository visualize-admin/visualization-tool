import * as React from "react";
function SvgIcFilter(props: React.SVGProps<SVGSVGElement>) {
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
        d="M9.481 20.564h4.556v-9.185l4.482-2.86V4H5v4.519l4.481 2.86v9.185zm3.806-.75h-3.056v-8.845L5.75 8.109V4.75h12.019v3.358l-4.482 2.86v8.846z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcFilter;
