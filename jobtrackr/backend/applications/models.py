from django.conf import settings
from django.db import models


class JobApplication(models.Model):
    """One job application that belongs to one user."""

    # (value stored in DB, label shown to humans)
    STATUS_CHOICES = [
        ("applied", "Applied"),
        ("under_review", "Under Review"),
        ("shortlisted", "Shortlisted"),
        ("interview", "Interview"),
        ("selected", "Selected"),
        ("rejected", "Rejected"),
        ("withdrawn", "Withdrawn"),
    ]

    JOB_TYPE_CHOICES = [
        ("full_time", "Full-time"),
        ("part_time", "Part-time"),
        ("internship", "Internship"),
        ("contract", "Contract"),
        ("freelance", "Freelance"),
    ]

    # ForeignKey = "this application belongs to ONE user".
    # on_delete=CASCADE: deleting a user also deletes their applications.
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="job_applications",
    )
    company_name = models.CharField(max_length=150)
    job_title = models.CharField(max_length=150)
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default="full_time")
    location = models.CharField(max_length=150, blank=True)
    job_url = models.URLField(max_length=500, blank=True)
    application_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="applied")
    salary = models.CharField(max_length=100, blank=True)  # text so "4-6 LPA" is allowed
    recruiter_name = models.CharField(max_length=100, blank=True)
    recruiter_email = models.EmailField(blank=True)
    interview_date = models.DateTimeField(null=True, blank=True)
    follow_up_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)  # set once, on creation
    updated_at = models.DateTimeField(auto_now=True)  # refreshed on every save

    class Meta:
        ordering = ["-application_date", "-created_at"]  # newest first
        indexes = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["user", "follow_up_date"]),
        ]

    def __str__(self):
        return f"{self.job_title} at {self.company_name}"
