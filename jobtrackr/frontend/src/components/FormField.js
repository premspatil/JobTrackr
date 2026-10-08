// One labelled form control with its validation message.
// Usage: <FormField label="Email" name="email" type="email" value={...} onChange={...} error={...} />
// Use `as="select"` or `as="textarea"` for other controls (options go in children).
function FormField({
  label, name, value, onChange, error, as = 'input', type = 'text',
  required = false, children, ...rest
}) {
  const className = `${as === 'select' ? 'form-select' : 'form-control'}${error ? ' is-invalid' : ''}`;
  const Control = as;
  const controlProps = { id: name, name, value, onChange, className, ...rest };
  if (as === 'input') controlProps.type = type;

  return (
    <div className="mb-3">
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      <Control {...controlProps}>{children}</Control>
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
}

export default FormField;
