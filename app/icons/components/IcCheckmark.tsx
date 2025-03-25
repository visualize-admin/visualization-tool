import * as React from "react";
function SvgIcCheckmark(props: React.SVGProps<SVGSVGElement>) {
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
        d="M9.913 17.443L5 12.531 5.531 12l4.382 4.383L19.295 7l.531.531-9.913 9.912z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcCheckmark;
