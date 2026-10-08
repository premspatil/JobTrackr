"""
Backend tests. Run with:  python manage.py test
Each test gets a fresh, empty test database (test_jobtrackr), so your real data is safe.
"""
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import JobApplication

User = get_user_model()


def make_application_payload(**overrides):
    """Valid data for creating an application; override any field per test."""
    data = {
        "company_name": "TCS",
        "job_title": "Python Developer",
        "job_type": "full_time",
        "location": "Pune",
        "application_date": str(timezone.localdate()),
        "status": "applied",
    }
    data.update(overrides)
    return data


class AuthTests(APITestCase):
    def test_register_creates_user(self):
        payload = {
            "first_name": "Prem", "last_name": "Patil", "email": "prem@example.com",
            "username": "prem", "password": "Str0ng!Pass99", "confirm_password": "Str0ng!Pass99",
        }
        response = self.client.post(reverse("register"), payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="prem").exists())
        self.assertNotIn("password", response.data)  # never send the password back

    def test_register_rejects_password_mismatch_and_duplicates(self):
        User.objects.create_user("prem", "prem@example.com", "Str0ng!Pass99")
        payload = {
            "first_name": "A", "last_name": "B", "email": "PREM@example.com",
            "username": "prem", "password": "Str0ng!Pass99", "confirm_password": "different",
        }
        response = self.client.post(reverse("register"), payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("username", response.data)
        self.assertIn("email", response.data)

    def test_login_with_username_and_with_email(self):
        User.objects.create_user("prem", "prem@example.com", "Str0ng!Pass99")
        for identifier in ("prem", "prem@example.com"):
            response = self.client.post(
                reverse("login"), {"username": identifier, "password": "Str0ng!Pass99"}, format="json"
            )
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertIn("access", response.data)
            self.assertIn("refresh", response.data)
            self.assertEqual(response.data["user"]["username"], "prem")

    def test_login_with_wrong_password_fails(self):
        User.objects.create_user("prem", "prem@example.com", "Str0ng!Pass99")
        response = self.client.post(reverse("login"), {"username": "prem", "password": "nope"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_blacklists_refresh_token(self):
        User.objects.create_user("prem", "prem@example.com", "Str0ng!Pass99")
        tokens = self.client.post(
            reverse("login"), {"username": "prem", "password": "Str0ng!Pass99"}, format="json"
        ).data
        response = self.client.post(reverse("logout"), {"refresh": tokens["refresh"]}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # The blacklisted refresh token can no longer be used
        again = self.client.post(reverse("token-refresh"), {"refresh": tokens["refresh"]}, format="json")
        self.assertEqual(again.status_code, status.HTTP_401_UNAUTHORIZED)


class ApplicationCrudTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("prem", "prem@example.com", "Str0ng!Pass99")
        self.client.force_authenticate(self.user)  # act as a logged-in user

    def test_create_application(self):
        response = self.client.post(reverse("application-list"), make_application_payload(), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        application = JobApplication.objects.get(pk=response.data["id"])
        self.assertEqual(application.user, self.user)  # owner is set by the server

    def test_create_requires_company_title_and_date(self):
        response = self.client.post(reverse("application-list"), {"company_name": "  "}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        for field in ("company_name", "job_title", "application_date"):
            self.assertIn(field, response.data)

    def test_create_validates_email_url_and_status(self):
        response = self.client.post(
            reverse("application-list"),
            make_application_payload(recruiter_email="not-an-email", job_url="not a url", status="flying"),
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        for field in ("recruiter_email", "job_url", "status"):
            self.assertIn(field, response.data)

    def test_client_cannot_choose_the_owner(self):
        other = User.objects.create_user("other", "other@example.com", "Str0ng!Pass99")
        response = self.client.post(
            reverse("application-list"), make_application_payload(user=other.id), format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(JobApplication.objects.get(pk=response.data["id"]).user, self.user)

    def test_list_and_retrieve_applications(self):
        JobApplication.objects.create(user=self.user, **make_application_payload())
        listing = self.client.get(reverse("application-list"))
        self.assertEqual(listing.status_code, status.HTTP_200_OK)
        self.assertEqual(listing.data["count"], 1)
        pk = listing.data["results"][0]["id"]
        detail = self.client.get(reverse("application-detail", args=[pk]))
        self.assertEqual(detail.status_code, status.HTTP_200_OK)
        self.assertEqual(detail.data["company_name"], "TCS")

    def test_update_put_and_patch(self):
        app = JobApplication.objects.create(user=self.user, **make_application_payload())
        url = reverse("application-detail", args=[app.pk])

        put = self.client.put(url, make_application_payload(company_name="Infosys", status="interview"), format="json")
        self.assertEqual(put.status_code, status.HTTP_200_OK)
        app.refresh_from_db()
        self.assertEqual((app.company_name, app.status), ("Infosys", "interview"))

        patch = self.client.patch(url, {"status": "selected"}, format="json")
        self.assertEqual(patch.status_code, status.HTTP_200_OK)
        app.refresh_from_db()
        self.assertEqual(app.status, "selected")

    def test_delete_application(self):
        app = JobApplication.objects.create(user=self.user, **make_application_payload())
        response = self.client.delete(reverse("application-detail", args=[app.pk]))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(JobApplication.objects.filter(pk=app.pk).exists())

    def test_missing_application_returns_404(self):
        response = self.client.get(reverse("application-detail", args=[99999]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_search_filter_and_ordering(self):
        JobApplication.objects.create(user=self.user, **make_application_payload(company_name="TCS", location="Pune"))
        JobApplication.objects.create(
            user=self.user,
            **make_application_payload(company_name="Infosys", job_title="Django Dev", location="Mumbai", status="interview", job_type="internship"),
        )
        url = reverse("application-list")

        self.assertEqual(self.client.get(url, {"search": "tcs"}).data["count"], 1)       # company
        self.assertEqual(self.client.get(url, {"search": "django"}).data["count"], 1)    # title
        self.assertEqual(self.client.get(url, {"search": "mumbai"}).data["count"], 1)    # location
        self.assertEqual(self.client.get(url, {"status": "interview"}).data["count"], 1)
        self.assertEqual(self.client.get(url, {"job_type": "internship"}).data["count"], 1)
        self.assertEqual(self.client.get(url, {"location": "pun"}).data["count"], 1)
        self.assertEqual(self.client.get(url, {"date_from": "2999-01-01"}).data["count"], 0)
        ordered = self.client.get(url, {"ordering": "company_name"}).data["results"]
        self.assertEqual([a["company_name"] for a in ordered], ["Infosys", "TCS"])
        self.assertEqual(self.client.get(url, {"date_from": "abc"}).status_code, status.HTTP_400_BAD_REQUEST)


class SecurityTests(APITestCase):
    def setUp(self):
        self.user_a = User.objects.create_user("usera", "a@example.com", "Str0ng!Pass99")
        self.user_b = User.objects.create_user("userb", "b@example.com", "Str0ng!Pass99")
        self.app_b = JobApplication.objects.create(user=self.user_b, **make_application_payload(company_name="SecretCo"))

    def test_unauthenticated_requests_are_rejected(self):
        endpoints = [
            reverse("application-list"), reverse("application-detail", args=[self.app_b.pk]),
            reverse("dashboard"), reverse("reminders"), reverse("profile"),
        ]
        for url in endpoints:
            self.assertEqual(self.client.get(url).status_code, status.HTTP_401_UNAUTHORIZED, url)

    def test_invalid_token_is_rejected(self):
        self.client.credentials(HTTP_AUTHORIZATION="Bearer not-a-real-token")
        self.assertEqual(self.client.get(reverse("application-list")).status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_cannot_access_another_users_application(self):
        self.client.force_authenticate(self.user_a)
        url = reverse("application-detail", args=[self.app_b.pk])
        self.assertEqual(self.client.get(url).status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(self.client.put(url, make_application_payload(), format="json").status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(self.client.patch(url, {"status": "rejected"}, format="json").status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(self.client.delete(url).status_code, status.HTTP_404_NOT_FOUND)
        self.app_b.refresh_from_db()  # still exists and unchanged
        self.assertEqual(self.app_b.status, "applied")

    def test_list_dashboard_and_reminders_only_include_own_data(self):
        self.client.force_authenticate(self.user_a)
        self.assertEqual(self.client.get(reverse("application-list")).data["count"], 0)
        self.assertEqual(self.client.get(reverse("dashboard")).data["stats"]["total"], 0)


class DashboardReminderProfileTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user("prem", "prem@example.com", "Str0ng!Pass99", first_name="Prem", last_name="Patil")
        self.client.force_authenticate(self.user)
        today = timezone.localdate()
        self.today = today
        create = lambda **kw: JobApplication.objects.create(user=self.user, **make_application_payload(**kw))
        create(company_name="A", status="applied", follow_up_date=today)
        create(company_name="B", status="applied", follow_up_date=today + timedelta(days=3))
        create(company_name="C", status="under_review", follow_up_date=today - timedelta(days=2))
        create(company_name="D", status="interview", interview_date=timezone.now() + timedelta(days=2))
        create(company_name="E", status="rejected", follow_up_date=today + timedelta(days=1))  # closed: no reminder
        create(company_name="F", status="selected")

    def test_dashboard_statistics_come_from_the_database(self):
        data = self.client.get(reverse("dashboard")).data
        self.assertEqual(data["stats"]["total"], 6)
        self.assertEqual(data["stats"]["applied"], 2)
        self.assertEqual(data["stats"]["interview"], 1)
        self.assertEqual(data["stats"]["rejected"], 1)
        self.assertEqual(data["stats"]["withdrawn"], 0)
        self.assertEqual(len(data["status_counts"]), 7)
        self.assertEqual(len(data["recent_applications"]), 5)
        # follow-ups: today + upcoming, open applications only, soonest first
        self.assertEqual([a["company_name"] for a in data["upcoming_followups"]], ["A", "B"])

    def test_reminders(self):
        data = self.client.get(reverse("reminders")).data
        self.assertEqual([a["company_name"] for a in data["todays_followups"]], ["A"])
        self.assertEqual([a["company_name"] for a in data["upcoming_followups"]], ["B"])
        self.assertEqual([a["company_name"] for a in data["overdue_followups"]], ["C"])
        self.assertEqual([a["company_name"] for a in data["interviews"]], ["D"])

    def test_profile_get_and_update(self):
        url = reverse("profile")
        self.assertEqual(self.client.get(url).data["username"], "prem")
        response = self.client.put(
            url, {"first_name": "Prem", "last_name": "P", "username": "prem2", "email": "new@example.com"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual((self.user.username, self.user.last_name), ("prem2", "P"))

    def test_profile_rejects_duplicate_username(self):
        User.objects.create_user("taken", "taken@example.com", "Str0ng!Pass99")
        response = self.client.put(
            reverse("profile"),
            {"first_name": "P", "last_name": "P", "username": "taken", "email": "prem@example.com"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("username", response.data)
