import React from "react";
function SvgIcEmbed(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M13.275 2.788l1.94.485-4.489 17.94-1.94-.485 4.489-17.94zM6 6.586L7.414 8l-4 4 4 4L6 17.414l-4.707-4.707a.999.999 0 010-1.414L6 6.586zm12 0l4.707 4.707a.999.999 0 010 1.414L18 17.414 16.586 16l4-4-4-4L18 6.586z"
      />
    </svg>
  );
}
export default SvgIcEmbed;
