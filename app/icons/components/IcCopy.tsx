import * as React from "react";
function SvgIcCopy(props: React.SVGProps<SVGSVGElement>) {
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
        d="M23 23H7V7h16v16zM21 9H9v12h12V9zM3 15V3h12v4h2V1H1v16h6v-2H3z"
      />
    </svg>
  );
}
export default SvgIcCopy;
