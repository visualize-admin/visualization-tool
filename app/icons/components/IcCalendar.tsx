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
      <g fill="none" fillRule="evenodd">
        <path d="M0 0h24v24H0z" />
        <path
          fill="currentColor"
          d="M7.5 9h3v3h-3V9zM12 9h3v3h-3V9zm4.5 0h3v3h-3V9zM3 18h3v3H3v-3zm4.5 0h3v3h-3v-3zm4.5 0h3v3h-3v-3zm-4.5-4.5h3v3h-3v-3zm4.5 0h3v3h-3v-3zm4.5 0h3v3h-3v-3zM3 13.5h3v3H3v-3zM19.5 0v1.5h-3V0H6v1.5H3V0H0v24h22.5V0h-3zM21 22.5H1.5V6H21v16.5z"
        />
      </g>
    </svg>
  );
}
export default SvgIcCalendar;
