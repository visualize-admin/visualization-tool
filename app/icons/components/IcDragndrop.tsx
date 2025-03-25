import * as React from "react";
function SvgIcDragndrop(props: React.SVGProps<SVGSVGElement>) {
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
        d="M8 6h2v2H8V6zm5 2h2V6h-2v2zm-5 5h2v-2H8v2zm5 0h2v-2h-2v2zm-5 5h2v-2H8v2zm5 0h2v-2h-2v2z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcDragndrop;
