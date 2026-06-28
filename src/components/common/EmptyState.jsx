export const EmptyState = ({ title, children }) => (
  <div className="empty">
    <div className="empty-title">{title}</div>
    {children}
  </div>
);
