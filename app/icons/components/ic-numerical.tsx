import * as React from "react";

function SvgIcNumerical(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <path d="M0 0h24v24H0z" />
        <path
          d="M5.559 21h2.597l.551-3.857h5.116L13.273 21h2.597l.552-3.857h3.292V14.57H16.79l.74-5.142H21V6.857h-3.109L18.441 3h-2.597l-.551 3.857h-5.116L10.727 3H8.13l-.552 3.857H4.286V9.43H7.21l-.74 5.142H3v2.572h3.109L5.559 21zM9.814 9.429h5.116l-.744 5.142H9.075l.74-5.142z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}

export default SvgIcNumerical;
