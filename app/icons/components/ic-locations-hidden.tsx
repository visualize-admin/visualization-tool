import * as React from "react";

function SvgIcLocationsHidden(props: React.SVGProps<SVGSVGElement>) {
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
          d="M2.052 1.586l20.534 20.533-1.467 1.467-5.41-5.41A24.043 24.043 0 0112.364 21S5 16.09 5 10.364c0-.868.15-1.7.425-2.472l-4.84-4.84 1.467-1.466zM12.364 3a7.364 7.364 0 017.363 7.364c0 1.776-.708 3.474-1.686 4.971l-3.625-3.625a2.455 2.455 0 00-3.398-3.4L7.522 4.815A7.335 7.335 0 0112.364 3z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}

export default SvgIcLocationsHidden;
