// These values MUST match the choices in backend/applications/models.py

export const STATUS_OPTIONS = [
  { value: 'applied', label: 'Applied' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview', label: 'Interview' },
  { value: 'selected', label: 'Selected' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

export const JOB_TYPE_OPTIONS = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'internship', label: 'Internship' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
];

// Colours used by the dashboard chart (badges use CSS classes in global.css)
export const STATUS_COLORS = {
  applied: '#3b82f6',
  under_review: '#f59e0b',
  shortlisted: '#8b5cf6',
  interview: '#06b6d4',
  selected: '#22c55e',
  rejected: '#ef4444',
  withdrawn: '#94a3b8',
};
