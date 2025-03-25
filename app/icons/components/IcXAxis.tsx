import * as React from "react";
function SvgIcXAxis(props: React.SVGProps<SVGSVGElement>) {
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
        d="M14 9l2.28-3.056L14.076 3h1.453l1.503 2.108L18.51 3h1.414l-2.179 2.944C18.115 6.43 19.631 8.514 20 9h-1.44l-1.58-2.208L15.428 9H14zM4.956 3H4v13.63h14.42l-2.248 3.83.952.54 2.878-4.899-2.878-4.898-.952.54 2.319 3.948H4.956V3z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcXAxis;
