import { getCommonIconProps, IconProps } from ".";

export const TwitterIcon = (props: IconProps) => {
  return (
    <svg {...getCommonIconProps(props)}>
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g transform="translate(5, 5.5)" fill="currentColor" fillRule="nonzero">
          <path d="M0.0340661185,0 L5.4393019,7.17024367 L0,13 L1.22426582,13 L5.98647424,7.89584566 L9.83406612,13 L14,13 L8.29051854,5.42651462 L13.3534486,0 L12.1291827,0 L7.74358114,4.70067954 L4.2,0 L0.0340661185,0 Z M1.83440175,0.894590572 L3.74821279,0.894590572 L12.1994294,12.1054094 L10.2856184,12.1054094 L1.83440175,0.894590572 Z" />
        </g>
      </g>
    </svg>
  );
};
