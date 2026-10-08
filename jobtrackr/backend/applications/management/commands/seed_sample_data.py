"""
Optional command that adds sample job applications for ONE user.

    python manage.py seed_sample_data                  # creates/uses user "demo"
    python manage.py seed_sample_data --username prem  # use an existing user
    python manage.py seed_sample_data --clear          # remove that user's applications first

It is never run automatically.
"""
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from applications.models import JobApplication

DEMO_PASSWORD = "Demo@12345"


class Command(BaseCommand):
    help = "Add sample job applications (TCS, Infosys, Wipro, ...) for a user."

    def add_arguments(self, parser):
        parser.add_argument("--username", default="demo", help="User to add data for (default: demo)")
        parser.add_argument("--clear", action="store_true", help="Delete this user's existing applications first")

    def handle(self, *args, **options):
        User = get_user_model()
        username = options["username"]

        user, created = User.objects.get_or_create(
            username=username,
            defaults={"email": f"{username}@example.com", "first_name": "Demo", "last_name": "User"},
        )
        if created:
            user.set_password(DEMO_PASSWORD)
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Created user '{username}' (password: {DEMO_PASSWORD})"))

        if options["clear"]:
            deleted, _ = JobApplication.objects.filter(user=user).delete()
            self.stdout.write(f"Removed {deleted} existing application(s).")

        today = timezone.localdate()
        now = timezone.now()
        samples = [
            ("TCS", "Python Developer", "full_time", "Pune", "interview", -10, 2, now + timedelta(days=3)),
            ("Infosys", "Django Developer", "full_time", "Bengaluru", "under_review", -7, 0, None),
            ("Wipro", "Backend Developer Intern", "internship", "Hyderabad", "applied", -5, 4, None),
            ("Accenture", "Full Stack Developer", "full_time", "Mumbai", "shortlisted", -12, 1, None),
            ("Cognizant", "Python Full Stack Developer", "full_time", "Chennai", "applied", -2, 6, None),
            ("Deloitte", "Software Engineer", "full_time", "Remote", "rejected", -20, None, None),
            ("Tech Mahindra", "Associate Software Engineer", "full_time", "Pune", "selected", -30, None, None),
            ("Capgemini", "Python Developer", "contract", "Nashik", "withdrawn", -15, None, None),
        ]
        for company, title, job_type, location, status, applied_offset, follow_offset, interview in samples:
            JobApplication.objects.create(
                user=user,
                company_name=company,
                job_title=title,
                job_type=job_type,
                location=location,
                status=status,
                application_date=today + timedelta(days=applied_offset),
                follow_up_date=None if follow_offset is None else today + timedelta(days=follow_offset),
                interview_date=interview,
                salary="3-5 LPA",
                recruiter_name="HR Team",
                recruiter_email=f"hr@{company.lower().replace(' ', '')}.example.com",
                notes="Sample data created by seed_sample_data.",
            )
        self.stdout.write(self.style.SUCCESS(f"Added {len(samples)} sample applications for '{username}'."))
