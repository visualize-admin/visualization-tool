import * as React from "react";
function SvgIcCheckHalf(props: React.SVGProps<SVGSVGElement>) {
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
        d="M19 7h-3V6h4v12h-4v-1h3V7zM5 7h3V6H4v12h4v-1H5V7zM16 9.647L10.914 15 8 11.933l.614-.647 2.3 2.42L15.386 9l.614.647z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcCheckHalf;
