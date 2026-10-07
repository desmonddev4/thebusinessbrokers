from django.contrib import admin
from .models import Cluster, Desk, Person, Enquiry
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
