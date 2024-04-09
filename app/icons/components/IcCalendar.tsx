import * as React from "react";
function SvgIcCalendar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <g fill="none" fillRule="evenodd" clipRule="evenodd">
        <path
          fill="currentColor"
          d="M17 13V15H7V13H17ZM19 5C20.103 5 21 5.897 21 7V19C21 20.103 20.103 21 19 21H5C3.897 21 3 20.103 3 19V7C3 5.897 3.897 5 5 5H7V3H9V5H15V3H17V5H19ZM5 19H19.002L19.0006 11H5V19ZM5 9H19V7H5V9Z"
        />
      </g>
    </svg>
  );
}
export default SvgIcCalendar;
