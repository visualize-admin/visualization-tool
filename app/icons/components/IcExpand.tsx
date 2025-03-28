import * as React from "react";
function SvgIcExpand(props: React.SVGProps<SVGSVGElement>) {
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
        d="M20.843 10.983l-1.477-5.507L13.861 4l-.196.725 4.674 1.252-5.651 5.65.53.531 5.65-5.65 1.25 4.669.725-.194zM11.629 12.688l-5.651 5.65-1.253-4.677-.725.194 1.476 5.508 5.507 1.476.194-.724-4.664-1.25 5.646-5.647-.53-.53z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcExpand;
