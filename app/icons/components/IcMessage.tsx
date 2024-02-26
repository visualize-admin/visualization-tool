import * as React from "react";
function SvgIcMessage(props: React.SVGProps<SVGSVGElement>) {
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
          d="M19 4H5c-.6 0-1 .4-1 1v11c0 .6.4 1 1 1h3.6l2.7 2.7c.2.2.4.3.7.3.3 0 .5-.1.7-.3l2.7-2.7H19c.6 0 1-.4 1-1V5c0-.6-.4-1-1-1zm-1 11h-3c-.3 0-.5.1-.7.3L12 17.6l-2.3-2.3c-.2-.2-.4-.3-.7-.3H6V6h12v9zm-2-7a1 1 0 011 1c0 .513-.386.936-1 1H8a1 1 0 01-1-1c0-.513.386-.936 1-1h8zm0 3a1 1 0 011 1c0 .513-.386.936-1 1H8a1 1 0 01-1-1c0-.513.386-.936 1-1h8z"
        />
      </g>
    </svg>
  );
}
export default SvgIcMessage;
