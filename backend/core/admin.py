from django.contrib import admin
from .models import Cluster, Desk, Person, Enquiry, ActivityLog, SiteContent, SiteSettings
@admin.register(Cluster)
class ClusterAdmin(admin.ModelAdmin): list_display = ["order","name"]; prepopulated_fields = {"slug":("short_name",)}
@admin.register(Desk)
class DeskAdmin(admin.ModelAdmin):
    list_display = ["code","name","cluster"]; list_filter = ["cluster"]; search_fields = ["name","code","focus_areas"]
    prepopulated_fields = {"slug":("name",)}
@admin.register(Person)
class PersonAdmin(admin.ModelAdmin): list_display = ["name","kind","order","published"]; list_filter = ["kind","published"]
@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = ["name","contact","desk","created","handled"]; list_filter = ["handled","desk"]
    readonly_fields = ["created"]
@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ["timestamp","action","content_type","object_name","user"]
    list_filter = ["action","content_type"]
    readonly_fields = ["timestamp"]

@admin.register(SiteContent)
class SiteContentAdmin(admin.ModelAdmin):
    list_display = ["section","key","value_type","updated_at"]
    list_filter = ["section","value_type"]
    search_fields = ["section","key","value"]
    readonly_fields = ["updated_at"]

@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ["key","value_type","description","updated_at"]
    list_filter = ["value_type"]
    search_fields = ["key","description"]
    readonly_fields = ["updated_at"]
