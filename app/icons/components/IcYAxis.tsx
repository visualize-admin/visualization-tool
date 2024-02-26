import * as React from "react";
function SvgIcYAxis(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <path d="M0 0h24v24H0z" />
        <path
          fill="currentColor"
          d="M6 4l4 5H7v9h13v2H5V9H2l4-5zm8.217 0l1.858 4.612h.03L17.963 4H20l-2.891 6.627c-.15.418-.305.826-.465 1.224-.16.408-.354.77-.584 1.09-.22.318-.5.571-.839.76-.36.2-.799.299-1.318.299-.48 0-.954-.07-1.423-.209l.134-1.478c.23.09.575.135 1.034.135.41-.01.73-.14.959-.388.23-.25.345-.577.345-.985L12 4h2.217z"
        />
      </g>
    </svg>
  );
}
export default SvgIcYAxis;
