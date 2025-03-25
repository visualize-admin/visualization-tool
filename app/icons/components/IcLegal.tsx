import * as React from "react";
function SvgIcLegal(props: React.SVGProps<SVGSVGElement>) {
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
        d="M4 12a8 8 0 018-8 8.009 8.009 0 018 8 8 8 0 11-16 0zm2 0a6 6 0 006 6 6.006 6.006 0 006-6 6 6 0 00-12 0z"
        fill="currentColor"
      />
      <path
        d="M12.214 10a1.8 1.8 0 01.833.177l.892.453.9-1.784-.891-.452A3.806 3.806 0 0012.214 8C9.923 8 8.5 9.532 8.5 12s1.423 4 3.714 4a3.806 3.806 0 001.739-.394l.891-.452-.9-1.784-.892.453a1.8 1.8 0 01-.838.177c-.514 0-1.714 0-1.714-2s1.2-2 1.714-2z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcLegal;
