import * as React from "react";

function SvgIcCategorical(props: React.SVGProps<SVGSVGElement>) {
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
          d="M20.663 12.338l-9-9c-.226-.226-.45-.338-.788-.338h-6.75C3.45 3 3 3.45 3 4.125v6.75c0 .338.112.563.337.787l9 9c.226.226.45.338.788.338s.563-.113.787-.337l6.75-6.75c.45-.45.45-1.126 0-1.575zM7.5 9C6.6 9 6 8.4 6 7.5S6.6 6 7.5 6 9 6.6 9 7.5 8.4 9 7.5 9z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}

export default SvgIcCategorical;
