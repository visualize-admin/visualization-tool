import * as React from "react";

function SvgIcColor(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <g transform="translate(3, 1)" fill="currentColor" fillRule="nonzero">
        <polygon
          transform="translate(11.75, 8.25) rotate(-45) translate(-11.75, -8.25)"
          points="7.87 0.47 15.64 0.47 15.64 16.02 7.87 16.02"
        />
        <path d="M1.68,7.33 L0.76,8.25 C-0.25,9.26 -0.25,10.90 0.76,11.91 L2.59,13.74 L0.76,15.58 C-0.25,16.59 -0.25,18.23 0.76,19.24 C1.77,20.25 3.41,20.25 4.42,19.24 L6.26,17.41 L8.09,19.24 C9.10,20.25 10.74,20.25 11.75,19.24 L12.67,18.32 L1.68,7.33 Z" />
      </g>
    </svg>
  );
}

export default SvgIcColor;
