import * as React from "react";

export const IconInfo = ({ size = 24, color = "currentColor" }) => (
         <svg
           xmlns="http://www.w3.org/2000/svg"
           width={size}
           height={size}
           viewBox="0 0 24 24"
         >
           <g fill="none" fillRule="evenodd">
             <path d="M0 0h24v24H0z" />
             <path
               d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 9v6h-2v-6h2zm0-4v2h-2V7h2z"
               fill={color}
             />
           </g>
         </svg>
       );