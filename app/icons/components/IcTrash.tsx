import * as React from "react";
function SvgIcTrash(props: React.SVGProps<SVGSVGElement>) {
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
        d="M14.77 5.532L13.46 4h-3.001l-1.31 1.532H4v.75h1.183v14.301h13.52v-14.3h1.13v-.75h-5.064zm-3.968-.782h2.309l.669.782h-3.647l.669-.782zM5.93 19.832h12.019V6.282H5.929v13.55z"
        fill="currentColor"
      />
      <path
        d="M6.96 7.75h.75v10.926h-.75V7.75zM9.25 7.75H10v10.926h-.75V7.75zM11.54 7.75h.75v10.926h-.75V7.75zM13.828 7.75h.75v10.926h-.75V7.75zM16.117 7.75h.75v10.926h-.75V7.75z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcTrash;
