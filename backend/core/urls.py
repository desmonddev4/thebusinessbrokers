from django.urls import path
from . import views as v
urlpatterns = [
    # Public endpoints
    path("login/", v.LoginView.as_view()),
    path("profile/", v.UserProfileView.as_view()),
    path("clusters/", v.ClusterList.as_view()),
    path("desks/", v.DeskList.as_view()),
    path("people/", v.PersonList.as_view()),
    path("enquiries/", v.EnquiryCreate.as_view()),
    path("site/", v.SiteInfo.as_view()),
    path("content/", v.SiteContentView.as_view()),
    # Admin endpoints (require authentication)
    path("admin/clusters/", v.ClusterListAdmin.as_view()),
    path("admin/clusters/<int:pk>/", v.ClusterDetailAdmin.as_view()),
    path("admin/desks/", v.DeskListAdmin.as_view()),
    path("admin/desks/<int:pk>/", v.DeskDetailAdmin.as_view()),
    path("admin/people/", v.PersonListAdmin.as_view()),
    path("admin/people/<int:pk>/", v.PersonDetailAdmin.as_view()),
    path("admin/enquiries/", v.EnquiryListAdmin.as_view()),
    path("admin/enquiries/<int:pk>/", v.EnquiryDetailAdmin.as_view()),
    path("admin/activity/", v.ActivityLogListAdmin.as_view()),
    path("admin/content/", v.SiteContentListAdmin.as_view()),
    path("admin/content/<int:pk>/", v.SiteContentDetailAdmin.as_view()),
    path("admin/settings/", v.SiteSettingsListAdmin.as_view()),
    path("admin/settings/<int:pk>/", v.SiteSettingsDetailAdmin.as_view()),
    path("admin/siteinfo/", v.SiteInfoListAdmin.as_view()),
    path("admin/siteinfo/<int:pk>/", v.SiteInfoDetailAdmin.as_view()),
]
