import * as React from "react";
function SvgIcIndeterminate(props: React.SVGProps<SVGSVGElement>) {
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
        d="M19.351 7.508L9.64 17.356l-4.99-5.06.852-.864L9.64 15.63l8.86-8.985.852.864zM5 18.628c-3.855-6.333-1.596-12.123-.022-14.19L4.256 4C2.54 6.256.191 12.36 4.234 19L5 18.628zM19.766 19c4.043-6.64 1.695-12.744-.022-15l-.722.437c1.574 2.068 3.834 7.858-.022 14.191l.766.372z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcIndeterminate;
