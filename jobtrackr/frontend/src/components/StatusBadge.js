import { STATUS_OPTIONS } from '../utils/constants';

// A coloured pill for an application status. Colours live in styles/global.css
// as classes like ".status-applied", ".status-interview", ...
function StatusBadge({ status }) {
  const label = STATUS_OPTIONS.find((option) => option.value === status)?.label || status;
  return <span className={`status-badge status-${status}`}>{label}</span>;
}

export default StatusBadge;
