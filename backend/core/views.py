from django.conf import settings
from django.http import FileResponse, Http404
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Cluster, Desk, Person, Enquiry
from .serializers import (
    ClusterSerializer, DeskSerializer, PersonSerializer, EnquirySerializer,
    DeskAdminSerializer, PersonAdminSerializer, EnquiryAdminSerializer
)

User = get_user_model()

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

# Authentication Views
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.check_password(password):
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_staff:
            return Response({'error': 'Admin access only'}, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
            }
        })

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
        })

# Admin CRUD Views
class DeskListAdmin(generics.ListCreateAPIView):
    queryset = Desk.objects.select_related('cluster').all()
    serializer_class = DeskAdminSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"Desk create request data: {request.data}")
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Desk create error: {str(e)}")
            raise

class DeskDetailAdmin(generics.RetrieveUpdateDestroyAPIView):
    queryset = Desk.objects.all()
    serializer_class = DeskAdminSerializer
    permission_classes = [IsAuthenticated]

class PersonListAdmin(generics.ListCreateAPIView):
    queryset = Person.objects.all()
    serializer_class = PersonAdminSerializer
    permission_classes = [IsAuthenticated]

class PersonDetailAdmin(generics.RetrieveUpdateDestroyAPIView):
    queryset = Person.objects.all()
    serializer_class = PersonAdminSerializer
    permission_classes = [IsAuthenticated]

class EnquiryListAdmin(generics.ListAPIView):
    queryset = Enquiry.objects.select_related('desk').all()
    serializer_class = EnquiryAdminSerializer
    permission_classes = [IsAuthenticated]

class EnquiryDetailAdmin(generics.RetrieveUpdateAPIView):
    queryset = Enquiry.objects.all()
    serializer_class = EnquiryAdminSerializer
    permission_classes = [IsAuthenticated]

def spa(request, path=""):
    """Serve the React app for its client-side routes. Unknown paths get the same shell with a real 404 status."""
    index = settings.FRONTEND_DIST / "index.html"
    if not index.exists():
        raise Http404("Frontend not built")
    return FileResponse(open(index, "rb"), content_type="text/html", status=200 if path.strip("/") in KNOWN_ROUTES else 404)
