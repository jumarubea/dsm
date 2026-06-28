export const Button = ({ variant = 'default', size, block, className = '', ...props }) => {
  const cls = [
    'btn',
    variant === 'primary' && 'btn-primary',
    variant === 'danger' && 'btn-danger',
    variant === 'ghost' && 'btn-ghost',
    size === 'sm' && 'btn-sm',
    size === 'lg' && 'btn-lg',
    block && 'btn-block',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return <button className={cls} {...props} />;
};
