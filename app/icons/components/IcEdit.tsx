import * as React from "react";
function SvgIcEdit(props: React.SVGProps<SVGSVGElement>) {
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
          d="M15.7 4.3c-.4-.4-1-.4-1.4 0l-10 10c-.2.2-.3.4-.3.7v4c0 .6.4 1 1 1h4c.3 0 .5-.1.7-.3l10-10c.4-.4.4-1 0-1.4l-4-4zM8.6 18H6v-2.6l6-6 2.6 2.6-6 6zm7.4-7.4L13.4 8 15 6.4 17.6 9 16 10.6z"
        />
      </g>
    </svg>
  );
}
export default SvgIcEdit;
