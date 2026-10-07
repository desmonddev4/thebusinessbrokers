from django.urls import path
from . import views as v
urlpatterns = [path("clusters/", v.ClusterList.as_view()), path("desks/", v.DeskList.as_view()),
    path("people/", v.PersonList.as_view()), path("enquiries/", v.EnquiryCreate.as_view()), path("site/", v.SiteInfo.as_view())]
