// A simple confirmation dialog (used before deleting). Built with Bootstrap CSS classes
// and React state, so no Bootstrap JavaScript is needed.
function ConfirmModal({ show, title = 'Please confirm', message, confirmText = 'Delete', loading = false, onCancel, onConfirm }) {
  if (!show) return null;
  return (
    <>
      <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onCancel} disabled={loading}></button>
            </div>
            <div className="modal-body">
              <p className="mb-0">{message}</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={loading}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={loading}>
                {loading ? 'Deleting...' : confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
}

export default ConfirmModal;
