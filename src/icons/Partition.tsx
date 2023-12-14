type IconProps = {
  color: string;
};
export const PartitionIcon = ({ color }: IconProps) => {
  return (
    <svg
      width='18'
      height='18'
      viewBox='0 0 18 18'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M0 3C0 1.343 1.343 -1.90735e-06 3 -1.90735e-06H15C16.657 -1.90735e-06 18 1.343 18 3V15C18 16.657 16.657 18 15 18H3C1.343 18 0 16.657 0 15V3ZM14.25 9C14.25 9.199 14.171 9.39 14.03 9.53L11.78 11.78C11.487 12.073 11.013 12.073 10.72 11.78C10.427 11.487 10.427 11.013 10.72 10.72L12.439 9L10.72 7.28C10.427 6.987 10.427 6.513 10.72 6.22C11.013 5.927 11.487 5.927 11.78 6.22L14.03 8.47C14.171 8.61 14.25 8.801 14.25 9ZM3.97 8.47C3.829 8.61 3.75 8.801 3.75 9C3.75 9.199 3.829 9.39 3.97 9.53L6.22 11.78C6.513 12.073 6.987 12.073 7.28 11.78C7.573 11.487 7.573 11.013 7.28 10.72L5.561 9L7.28 7.28C7.573 6.987 7.573 6.513 7.28 6.22C6.987 5.927 6.513 5.927 6.22 6.22L3.97 8.47Z'
        fill={color}
      />
    </svg>
  );
};
