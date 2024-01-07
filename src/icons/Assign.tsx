type IconProps = {
  color: string;
};
export const AssignmentIcon = ({ color }: IconProps) => {
  return (
    <svg
      width='21'
      height='18'
      viewBox='0 0 21 18'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M4.00716 1.04801C4.57716 0.383006 5.40916 6.19888e-06 6.28516 6.19888e-06H14.7152C15.5912 6.19888e-06 16.4232 0.383006 16.9932 1.04801L18.7152 3.05701C18.4822 3.02001 18.2432 3.00001 18.0002 3.00001H3.00016C2.75716 3.00001 2.51816 3.02001 2.28516 3.05701L4.00716 1.04801Z'
        fill={color}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M0 7.50037C0 5.84337 1.343 4.50037 3 4.50037H18C19.657 4.50037 21 5.84337 21 7.50037C21 9.15737 19.657 10.5004 18 10.5004H3C1.343 10.5004 0 9.15737 0 7.50037ZM15 7.50037C15 7.91437 14.664 8.25037 14.25 8.25037C13.836 8.25037 13.5 7.91437 13.5 7.50037C13.5 7.08637 13.836 6.75037 14.25 6.75037C14.664 6.75037 15 7.08637 15 7.50037ZM17.25 8.25037C17.664 8.25037 18 7.91437 18 7.50037C18 7.08637 17.664 6.75037 17.25 6.75037C16.836 6.75037 16.5 7.08637 16.5 7.50037C16.5 7.91437 16.836 8.25037 17.25 8.25037Z'
        fill={color}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M3 12.0004C1.343 12.0004 0 13.3434 0 15.0004C0 16.6574 1.343 18.0004 3 18.0004H18C19.657 18.0004 21 16.6574 21 15.0004C21 13.3434 19.657 12.0004 18 12.0004H3ZM14.25 15.7504C14.664 15.7504 15 15.4144 15 15.0004C15 14.5864 14.664 14.2504 14.25 14.2504C13.836 14.2504 13.5 14.5864 13.5 15.0004C13.5 15.4144 13.836 15.7504 14.25 15.7504ZM18 15.0004C18 15.4144 17.664 15.7504 17.25 15.7504C16.836 15.7504 16.5 15.4144 16.5 15.0004C16.5 14.5864 16.836 14.2504 17.25 14.2504C17.664 14.2504 18 14.5864 18 15.0004Z'
        fill={color}
      />
    </svg>
  );
};