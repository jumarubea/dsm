export const Field = ({ label, error, hint, children }) => (
  <div className="field">
    {label && <label>{label}</label>}
    {children}
    {hint && !error && <span className="hint">{hint}</span>}
    {error && <span className="err">{error}</span>}
  </div>
);
