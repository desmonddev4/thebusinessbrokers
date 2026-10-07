from django.conf import settings
from django.http import FileResponse, Http404
from django.core.mail import send_mail
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Cluster, Desk, Person, Enquiry
from .serializers import ClusterSerializer, DeskSerializer, PersonSerializer, EnquirySerializer

class ClusterList(generics.ListAPIView):
    queryset = Cluster.objects.prefetch_related("desks"); serializer_class = ClusterSerializer; pagination_class = None

class DeskList(generics.ListAPIView):
    queryset = Desk.objects.select_related("cluster"); serializer_class = DeskSerializer; pagination_class = None

class PersonList(generics.ListAPIView):
    serializer_class = PersonSerializer; pagination_class = None
    def get_queryset(self):
        qs = Person.objects.filter(published=True)
        kind = self.request.query_params.get("kind")
        return qs.filter(kind=kind) if kind else qs

class EnquiryCreate(generics.CreateAPIView):
    serializer_class = EnquirySerializer; throttle_scope = "enquiry"
    def create(self, request, *a, **kw):
        s = self.get_serializer(data=request.data); s.is_valid(raise_exception=True)
        if s.validated_data.pop("website", ""):  # bot filled the honeypot: pretend success, store nothing
            return Response({"ok": True}, status=status.HTTP_201_CREATED)
        enq = Enquiry.objects.create(**s.validated_data)
        if settings.ENQUIRY_NOTIFY_EMAIL:
            try:
                send_mail(f"Website enquiry: {enq.desk or 'Not sure yet'}",
                    f"{enq.name}\n{enq.contact}\n\n{enq.message}", None, [settings.ENQUIRY_NOTIFY_EMAIL])
            except Exception: pass  # enquiry is already saved; never lose it to a mail failure
        return Response({"ok": True}, status=status.HTTP_201_CREATED)

class SiteInfo(APIView):
    """Registered particulars. Email is blank until the firm supplies one."""
    def get(self, request):
        return Response({"name":"Top Business Brokers Consult Limited","registration":"CS054812019",
            "incorporated":"19 March 2007","company_type":"Private limited company",
            "address":"Near Liberation Christian Centre, Bomso, Kumasi, Ashanti Region, Ghana","post":"P. O. Box UP 629, KNUST, Kumasi",
            "phones":["+233 (0) 243 555 882","+233 (0) 243 257 214"],"tin":"C0022801235","auditors":"Bridgewater Consulting, Kumasi","email":""})


KNOWN_ROUTES = {"", "about", "what-we-broker", "how-we-work", "network", "initiatives", "contact"}

def spa(request, path=""):
    """Serve the React app for its client-side routes. Unknown paths get the same shell with a real 404 status."""
    index = settings.FRONTEND_DIST / "index.html"
    if not index.exists():
        raise Http404("Frontend not built")
    return FileResponse(open(index, "rb"), content_type="text/html", status=200 if path.strip("/") in KNOWN_ROUTES else 404)
