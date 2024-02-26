import * as React from "react";
function SvgIcMail(props: React.SVGProps<SVGSVGElement>) {
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
        d="M21 2a3 3 0 013 3v14a3 3 0 01-3 3H3a3 3 0 01-3-3V5a3 3 0 013-3h18zm1 3.344l-10 9.001-10-9V19a1 1 0 001 1h18a1 1 0 001-1V5.344zM20.504 4H3.495L12 11.655 20.504 4z"
      />
    </svg>
  );
}
export default SvgIcMail;
