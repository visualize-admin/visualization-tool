import * as React from "react";
function SvgIcZoomIn(props: React.SVGProps<SVGSVGElement>) {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.86 11v3h1v-3h3v-1h-3V7h-1v3h-3v1h3z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.743 10.485c0 3.03-2.41 5.486-5.382 5.486-2.973 0-5.382-2.456-5.382-5.486s2.41-5.487 5.382-5.487c2.972 0 5.382 2.456 5.382 5.487zm-1.092 4.787a6.27 6.27 0 01-4.29 1.697C6.848 16.969 4 14.066 4 10.484 4 6.905 6.848 4 10.36 4c3.514 0 6.361 2.903 6.361 6.485a6.536 6.536 0 01-1.4 4.059L19 18.294l-.692.706-3.657-3.728z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcZoomIn;
