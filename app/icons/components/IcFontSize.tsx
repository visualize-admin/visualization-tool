import * as React from "react";
function SvgIcFontSize(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcFontSize;
