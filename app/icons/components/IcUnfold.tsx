import * as React from "react";
function SvgIcUnfold(props: React.SVGProps<SVGSVGElement>) {
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
        d="M7.38 14L12 17.01 16.62 14l.38.742L12 18l-5-3.258.38-.742zM17 9.257L12 6 7 9.257l.38.743L12 6.99 16.62 10l.38-.743z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcUnfold;
