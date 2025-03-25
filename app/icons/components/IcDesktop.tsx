import * as React from "react";
function SvgIcDesktop(props: React.SVGProps<SVGSVGElement>) {
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
        d="M20.582 5v12.051h-7.916v.718H14.9v.75H9.89v-.75h2.027v-.718H4V5h16.582zm-.749.75H4.75v10.551h15.083V5.75z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcDesktop;
