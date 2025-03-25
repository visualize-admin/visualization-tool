import * as React from "react";
function SvgIcCheckmarkCircle(props: React.SVGProps<SVGSVGElement>) {
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
        d="M10.361 16.669l-3.385-3.385.544-.544 2.841 2.842 6.543-6.543.544.544-7.087 7.086z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.278 5.432A8.5 8.5 0 0112.001 4a8.51 8.51 0 018.499 8.5A8.5 8.5 0 117.278 5.432zm-2.42 10.024A7.731 7.731 0 0012 20.228a7.74 7.74 0 007.73-7.731 7.731 7.731 0 10-14.874 2.959z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcCheckmarkCircle;
