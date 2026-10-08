from django.contrib import admin

from .models import JobApplication

# Users are already manageable in the admin: django.contrib.auth registers
# the User model automatically. We add the JobApplication model here.


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ("company_name", "job_title", "status", "application_date", "follow_up_date", "user")
    list_filter = ("status", "job_type", "application_date", "follow_up_date")
    search_fields = ("company_name", "job_title", "location", "user__username", "user__email")
    date_hierarchy = "application_date"
    list_select_related = ("user",)
