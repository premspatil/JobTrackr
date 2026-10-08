// Spinner + message shown while data is loading, e.g. <Loading text="Loading applications..." />
function Loading({ text = 'Loading...' }) {
  return (
    <div className="loading-box" role="status" aria-live="polite">
      <div className="spinner-border text-primary" aria-hidden="true"></div>
      <p className="mt-3 mb-0 text-muted">{text}</p>
    </div>
  );
}

export default Loading;
