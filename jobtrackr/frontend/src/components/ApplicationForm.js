import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage, getFieldErrors } from '../api/api';
import { JOB_TYPE_OPTIONS, STATUS_OPTIONS } from '../utils/constants';
import { todayString, toDateTimeInput } from '../utils/format';
import FormField from './FormField';

const getEmptyForm = () => ({
  company_name: '',
  job_title: '',
  job_type: 'full_time',
  location: '',
  job_url: '',
  application_date: todayString(),
  status: 'applied',
  salary: '',
  recruiter_name: '',
  recruiter_email: '',
  interview_date: '',
  follow_up_date: '',
  notes: '',
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Turn an application from the API into form values (null -> '' for inputs)
const toFormValues = (application) => {
  const empty = getEmptyForm();
  if (!application) return empty;
  return {
    ...Object.fromEntries(Object.keys(empty).map((key) => [key, application[key] ?? ''])),
    interview_date: toDateTimeInput(application.interview_date),
  };
};

// Frontend validation (the backend validates again - never trust the browser alone)
const validate = (values) => {
  const errors = {};
  if (!values.company_name.trim()) errors.company_name = 'Company name is required.';
  if (!values.job_title.trim()) errors.job_title = 'Job title is required.';
  if (!values.application_date) errors.application_date = 'Application date is required.';
  if (values.job_url.trim()) {
    try {
      const url = new URL(values.job_url.trim());
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('bad protocol');
    } catch {
      errors.job_url = 'Enter a valid URL starting with http:// or https://';
    }
  }
  if (values.recruiter_email.trim() && !EMAIL_PATTERN.test(values.recruiter_email.trim())) {
    errors.recruiter_email = 'Enter a valid email address.';
  }
  if (values.follow_up_date && values.application_date && values.follow_up_date < values.application_date) {
    errors.follow_up_date = 'Follow-up date cannot be before the application date.';
  }
  return errors;
};

// Used by BOTH the Add and the Edit page.
//  - initialValues: existing application when editing, nothing when adding
//  - onSubmit(payload): async function that calls the API
function ApplicationForm({ initialValues, onSubmit, submitLabel = 'Save Application', cancelTo = '/applications' }) {
  const navigate = useNavigate();
  const [values, setValues] = useState(() => toFormValues(initialValues));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: '' })); // clear message while typing
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const foundErrors = validate(values);
    setErrors(foundErrors);
    if (Object.keys(foundErrors).length > 0) return;

    // Build the JSON sent to the API: trim text, send null for empty optional dates
    const payload = {
      ...values,
      company_name: values.company_name.trim(),
      job_title: values.job_title.trim(),
      job_url: values.job_url.trim(),
      recruiter_email: values.recruiter_email.trim(),
      interview_date: values.interview_date || null,
      follow_up_date: values.follow_up_date || null,
    };

    setSaving(true);
    try {
      await onSubmit(payload);
    } catch (error) {
      // Messages from the backend validation (e.g. invalid email) are shown under the fields
      const fieldErrors = getFieldErrors(error);
      setErrors(fieldErrors);
      setFormError(
        Object.keys(fieldErrors).length > 0
          ? 'Please fix the highlighted fields.'
          : getErrorMessage(error, 'Could not save the application.')
      );
      setSaving(false);
    }
    // On success the page navigates away, so we don't reset "saving" here.
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="card form-card">
      <div className="card-body">
        {formError && <div className="alert alert-danger">{formError}</div>}

        <div className="row">
          <div className="col-md-6">
            <FormField label="Company Name" name="company_name" value={values.company_name} onChange={handleChange} error={errors.company_name} required maxLength={150} />
          </div>
          <div className="col-md-6">
            <FormField label="Job Title" name="job_title" value={values.job_title} onChange={handleChange} error={errors.job_title} required maxLength={150} />
          </div>
          <div className="col-md-6">
            <FormField label="Job Type" name="job_type" as="select" value={values.job_type} onChange={handleChange} error={errors.job_type}>
              {JOB_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </FormField>
          </div>
          <div className="col-md-6">
            <FormField label="Location" name="location" value={values.location} onChange={handleChange} error={errors.location} placeholder="e.g. Pune / Remote" maxLength={150} />
          </div>
          <div className="col-12">
            <FormField label="Job URL" name="job_url" type="url" value={values.job_url} onChange={handleChange} error={errors.job_url} placeholder="https://..." />
          </div>
          <div className="col-md-6">
            <FormField label="Application Date" name="application_date" type="date" value={values.application_date} onChange={handleChange} error={errors.application_date} required />
          </div>
          <div className="col-md-6">
            <FormField label="Status" name="status" as="select" value={values.status} onChange={handleChange} error={errors.status}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </FormField>
          </div>
          <div className="col-md-6">
            <FormField label="Salary" name="salary" value={values.salary} onChange={handleChange} error={errors.salary} placeholder="e.g. 4-6 LPA" maxLength={100} />
          </div>
          <div className="col-md-6">
            <FormField label="Recruiter Name" name="recruiter_name" value={values.recruiter_name} onChange={handleChange} error={errors.recruiter_name} maxLength={100} />
          </div>
          <div className="col-md-6">
            <FormField label="Recruiter Email" name="recruiter_email" type="email" value={values.recruiter_email} onChange={handleChange} error={errors.recruiter_email} />
          </div>
          <div className="col-md-6">
            <FormField label="Interview Date" name="interview_date" type="datetime-local" value={values.interview_date} onChange={handleChange} error={errors.interview_date} />
          </div>
          <div className="col-md-6">
            <FormField label="Follow-up Date" name="follow_up_date" type="date" value={values.follow_up_date} onChange={handleChange} error={errors.follow_up_date} />
          </div>
          <div className="col-12">
            <FormField label="Notes" name="notes" as="textarea" rows={4} value={values.notes} onChange={handleChange} error={errors.notes} />
          </div>
        </div>

        <div className="d-flex gap-2 mt-2">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving application...' : submitLabel}
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(cancelTo)} disabled={saving}>
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

export default ApplicationForm;
