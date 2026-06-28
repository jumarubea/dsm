export const Badge = ({ tone = 'default', children }) => (
  <span className={`badge${tone !== 'default' ? ` badge-${tone}` : ''}`}>{children}</span>
);
