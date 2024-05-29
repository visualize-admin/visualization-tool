import * as React from "react";

function SvgIcDuplicate(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21 17h-3v-2h1V5H9v1H7V3h14v14z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 21H3V8h13v13zm-1.857-1.857V9.857H4.857v9.286h9.286z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgIcDuplicate;

