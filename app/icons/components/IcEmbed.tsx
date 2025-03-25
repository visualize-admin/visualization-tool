import * as React from "react";
function SvgIcEmbed(props: React.SVGProps<SVGSVGElement>) {
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
        d="M10 18.5l3.002-13h1L11 18.5h-1zM19.002 12l-4-2V9l5 2.5v1l-5 2.5v-1l4-2zM5 11.999l4 2v1l-5-2.5v-1l5-2.5v1l-4 2z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcEmbed;
