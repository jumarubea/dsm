export const Spinner = () => <span className="spinner" role="status" aria-label="loading" />;

export const Loading = ({ label }) => (
  <div className="row" style={{ padding: '2rem', justifyContent: 'center' }}>
    <Spinner />
    {label && <span className="muted">{label}</span>}
  </div>
);
