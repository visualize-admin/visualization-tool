import * as React from "react";

function SvgIcLocations(props: React.SVGProps<SVGSVGElement>) {
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
          d="M12.364 3a7.364 7.364 0 017.363 7.364C19.727 16.09 12.364 21 12.364 21S5 16.09 5 10.364A7.364 7.364 0 0112.364 3zm0 4.91a2.455 2.455 0 100 4.908 2.455 2.455 0 000-4.909z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}

export default SvgIcLocations;
