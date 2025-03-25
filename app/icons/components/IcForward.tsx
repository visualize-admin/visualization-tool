import * as React from "react";
function SvgIcForward(props: React.SVGProps<SVGSVGElement>) {
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
        d="M11.61 20L20 12l-8.39-8v7.28L4 4v16l7.61-7.28V20zm1.066-2.443L18.504 12l-5.828-5.557v11.114zM10.87 12l-5.803 5.551V6.449L10.87 12z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcForward;
