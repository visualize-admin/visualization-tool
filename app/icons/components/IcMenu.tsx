import * as React from "react";
function SvgIcMenu(props: React.SVGProps<SVGSVGElement>) {
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
        d="M4.469 5.617h15.833v.75H4.469v-.75zM4.469 12h15.833v.75H4.469V12zM4.469 18.383h15.833v.75H4.469v-.75z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcMenu;
