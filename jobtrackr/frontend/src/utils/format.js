// Date helpers. The API sends dates as "YYYY-MM-DD" and date-times as ISO strings.

// "2026-10-08" -> Date in LOCAL time (new Date("2026-10-08") would be UTC and can shift a day)
const parseDateOnly = (value) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const formatDate = (value) => {
  if (!value) return '—';
  return parseDateOnly(value).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

// ISO date-time from the API -> "YYYY-MM-DDTHH:mm" for <input type="datetime-local">
export const toDateTimeInput = (value) => {
  if (!value) return '';
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Today as "YYYY-MM-DD" in local time
export const todayString = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
