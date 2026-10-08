from django.conf import settings
from django.http import FileResponse, Http404
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Cluster, Desk, Person, Enquiry, ActivityLog, SiteContent, SiteSettings, SiteInfo, MediaFile
from .serializers import (
    ClusterSerializer, DeskSerializer, PersonSerializer, EnquirySerializer,
    DeskAdminSerializer, PersonAdminSerializer, EnquiryAdminSerializer, ActivityLogSerializer, ClusterAdminSerializer,
    SiteContentSerializer, SiteSettingsSerializer, SiteInfoSerializer, MediaFileSerializer
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

class SiteInfoView(APIView):
    """Registered particulars. Email is blank until the firm supplies one."""
    def get(self, request):
        # Try to get from database, fall back to defaults if none exists
        try:
            from .models import SiteInfo as SiteInfoModel
            from .serializers import SiteInfoSerializer
            info = SiteInfoModel.objects.first()
            if info:
                serializer = SiteInfoSerializer(info)
                return Response(serializer.data)
        except Exception:
            pass

        # Fallback to hardcoded defaults
        return Response({
            "name":"Top Business Brokers Consult Limited",
            "registration":"CS054812019",
            "incorporated":"19 March 2007",
            "company_type":"Private limited company",
            "address":"Near Liberation Christian Centre, Bomso, Kumasi, Ashanti Region, Ghana",
            "post":"P. O. Box UP 629, KNUST, Kumasi",
            "phones":["+233 (0) 243 555 882","+233 (0) 243 257 214"],
            "tin":"C0022801235",
            "auditors":"Bridgewater Consulting, Kumasi",
            "email":""
        })

class SiteContentView(APIView):
    """Public endpoint for frontend to fetch editable content"""
    permission_classes = [AllowAny]

    def get(self, request):
        content = SiteContent.objects.all()
        serializer = SiteContentSerializer(content, many=True)
        # Return as a dictionary for easier access: {section.key: value}
        result = {}
        for item in serializer.data:
            key = f"{item['section']}.{item['key']}"
            result[key] = {
                "value": item["value"],
                "type": item["value_type"]
            }
        return Response(result)


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

class UserListAdmin(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.filter(is_staff=True).values('id', 'username', 'email', 'is_staff', 'is_superuser', 'date_joined')
        return Response(list(users))

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        is_superuser = request.data.get('is_superuser', False)

        if not username or not password:
            return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create(
            username=username,
            email=email,
            password=make_password(password),
            is_staff=True,
            is_superuser=is_superuser
        )

        ActivityLog.objects.create(
            action=ActivityLog.ActionType.CREATE,
            content_type="user",
            object_id=user.id,
            object_name=user.username,
            description=f"Created admin user: {user.username}",
            user=request.user.username if request.user.is_authenticated else 'Anonymous'
        )

        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
        }, status=status.HTTP_201_CREATED)

class UserDetailAdmin(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id, is_staff=True)
            return Response({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'date_joined': user.date_joined,
            })
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, user_id):
        try:
            user = User.objects.get(id=user_id, is_staff=True)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Prevent users from deactivating themselves
        if user.id == request.user.id and request.data.get('is_staff') == False:
            return Response({'error': 'Cannot deactivate your own account'}, status=status.HTTP_400_BAD_REQUEST)

        email = request.data.get('email')
        password = request.data.get('password')
        is_superuser = request.data.get('is_superuser', user.is_superuser)

        if email:
            user.email = email
        if password:
            user.password = make_password(password)
        user.is_superuser = is_superuser
        user.save()

        ActivityLog.objects.create(
            action=ActivityLog.ActionType.UPDATE,
            content_type="user",
            object_id=user.id,
            object_name=user.username,
            description=f"Updated admin user: {user.username}",
            user=request.user.username if request.user.is_authenticated else 'Anonymous'
        )

        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
        })

    def delete(self, request, user_id):
        try:
            user = User.objects.get(id=user_id, is_staff=True)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Prevent users from deleting themselves
        if user.id == request.user.id:
            return Response({'error': 'Cannot delete your own account'}, status=status.HTTP_400_BAD_REQUEST)

        username = user.username
        user.delete()

        ActivityLog.objects.create(
            action=ActivityLog.ActionType.DELETE,
            content_type="user",
            object_id=user_id,
            object_name=username,
            description=f"Deleted admin user: {username}",
            user=request.user.username if request.user.is_authenticated else 'Anonymous'
        )

        return Response(status=status.HTTP_204_NO_CONTENT)

# Admin CRUD Views
class ClusterListAdmin(generics.ListCreateAPIView):
    queryset = Cluster.objects.all()
    serializer_class = ClusterAdminSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        ActivityLog.objects.create(
            action=ActivityLog.ActionType.CREATE,
            content_type="cluster",
            object_id=response.data.get('id'),
            object_name=response.data.get('name'),
            description=f"Created cluster: {response.data.get('name')}",
            user=request.user.username if request.user.is_authenticated else 'Anonymous'
        )
        return response

class ClusterDetailAdmin(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cluster.objects.all()
    serializer_class = ClusterAdminSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        cluster = self.get_object()
        ActivityLog.objects.create(
            action=ActivityLog.ActionType.UPDATE,
            content_type="cluster",
            object_id=cluster.id,
            object_name=cluster.name,
            description=f"Updated cluster: {cluster.name}",
            user=request.user.username if request.user.is_authenticated else 'Anonymous'
        )
        return response

    def destroy(self, request, *args, **kwargs):
        cluster = self.get_object()
        ActivityLog.objects.create(
            action=ActivityLog.ActionType.DELETE,
            content_type="cluster",
            object_id=cluster.id,
            object_name=cluster.name,
            description=f"Deleted cluster: {cluster.name}",
            user=request.user.username if request.user.is_authenticated else 'Anonymous'
        )
        return super().destroy(request, *args, **kwargs)

class DeskListAdmin(generics.ListCreateAPIView):
    queryset = Desk.objects.select_related('cluster').all()
    serializer_class = DeskAdminSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"Desk create request data: {request.data}")
        try:
            response = super().create(request, *args, **kwargs)
            # Log activity
            ActivityLog.objects.create(
                action=ActivityLog.ActionType.CREATE,
                content_type=ActivityLog.ContentType.DESK,
                object_id=response.data.get('id'),
                object_name=response.data.get('name'),
                description=f"Created desk: {response.data.get('name')} ({response.data.get('code')})",
                user=request.user.username if request.user.is_authenticated else 'Anonymous'
            )
            return response
        except Exception as e:
            logger.error(f"Desk create error: {str(e)}")
            raise

class DeskDetailAdmin(generics.RetrieveUpdateDestroyAPIView):
    queryset = Desk.objects.all()
    serializer_class = DeskAdminSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        desk = self.get_object()
        ActivityLog.objects.create(
            action=ActivityLog.ActionType.UPDATE,
            content_type=ActivityLog.ContentType.DESK,
            object_id=desk.id,
            object_name=desk.name,
            description=f"Updated desk: {desk.name} ({desk.code})",
            user=request.user.username if request.user.is_authenticated else 'Anonymous'
        )
        return response

    def destroy(self, request, *args, **kwargs):
        desk = self.get_object()
        ActivityLog.objects.create(
            action=ActivityLog.ActionType.DELETE,
            content_type=ActivityLog.ContentType.DESK,
            object_id=desk.id,
            object_name=desk.name,
            description=f"Deleted desk: {desk.name} ({desk.code})",
            user=request.user.username if request.user.is_authenticated else 'Anonymous'
        )
        return super().destroy(request, *args, **kwargs)

class PersonListAdmin(generics.ListCreateAPIView):
    queryset = Person.objects.all()
    serializer_class = PersonAdminSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        ActivityLog.objects.create(
            action=ActivityLog.ActionType.CREATE,
            content_type=ActivityLog.ContentType.PERSON,
            object_id=response.data.get('id'),
            object_name=response.data.get('name'),
            description=f"Created person: {response.data.get('name')} ({response.data.get('kind')})",
            user=request.user.username if request.user.is_authenticated else 'Anonymous'
        )
        return response

class PersonDetailAdmin(generics.RetrieveUpdateDestroyAPIView):
    queryset = Person.objects.all()
    serializer_class = PersonAdminSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        person = self.get_object()
        ActivityLog.objects.create(
            action=ActivityLog.ActionType.UPDATE,
            content_type=ActivityLog.ContentType.PERSON,
            object_id=person.id,
            object_name=person.name,
            description=f"Updated person: {person.name} ({person.kind})",
            user=request.user.username if request.user.is_authenticated else 'Anonymous'
        )
        return response

    def destroy(self, request, *args, **kwargs):
        person = self.get_object()
        ActivityLog.objects.create(
            action=ActivityLog.ActionType.DELETE,
            content_type=ActivityLog.ContentType.PERSON,
            object_id=person.id,
            object_name=person.name,
            description=f"Deleted person: {person.name} ({person.kind})",
            user=request.user.username if request.user.is_authenticated else 'Anonymous'
        )
        return super().destroy(request, *args, **kwargs)

class EnquiryListAdmin(generics.ListAPIView):
    queryset = Enquiry.objects.select_related('desk').all()
    serializer_class = EnquiryAdminSerializer
    permission_classes = [IsAuthenticated]

class EnquiryDetailAdmin(generics.RetrieveUpdateAPIView):
    queryset = Enquiry.objects.all()
    serializer_class = EnquiryAdminSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        enquiry = self.get_object()
        ActivityLog.objects.create(
            action=ActivityLog.ActionType.UPDATE,
            content_type=ActivityLog.ContentType.ENQUIRY,
            object_id=enquiry.id,
            object_name=enquiry.name,
            description=f"Updated enquiry from {enquiry.name}",
            user=request.user.username if request.user.is_authenticated else 'Anonymous'
        )
        return response

class ActivityLogListAdmin(generics.ListAPIView):
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

class SiteContentListAdmin(generics.ListCreateAPIView):
    queryset = SiteContent.objects.all()
    serializer_class = SiteContentSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        ActivityLog.objects.create(
            action=ActivityLog.ActionType.CREATE,
            content_type=ActivityLog.ContentType.CONTENT,
            object_id=response.data.get('id'),
            object_name=f"{response.data.get('section')}.{response.data.get('key')}",
            description=f"Created content: {response.data.get('section')}.{response.data.get('key')}",
            user=request.user.username if request.user.is_authenticated else 'Anonymous'
        )
        return response

class SiteContentDetailAdmin(generics.RetrieveUpdateDestroyAPIView):
    queryset = SiteContent.objects.all()
    serializer_class = SiteContentSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        content = self.get_object()
        ActivityLog.objects.create(
            action=ActivityLog.ActionType.UPDATE,
            content_type=ActivityLog.ContentType.CONTENT,
            object_id=content.id,
            object_name=f"{content.section}.{content.key}",
            description=f"Updated content: {content.section}.{content.key}",
            user=request.user.username if request.user.is_authenticated else 'Anonymous'
        )
        return response

class SiteSettingsListAdmin(generics.ListCreateAPIView):
    queryset = SiteSettings.objects.all()
    serializer_class = SiteSettingsSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        ActivityLog.objects.create(
            action=ActivityLog.ActionType.CREATE,
            content_type=ActivityLog.ContentType.SETTING,
            object_id=response.data.get('id'),
            object_name=response.data.get('key'),
            description=f"Created setting: {response.data.get('key')}",
            user=request.user.username if request.user.is_authenticated else 'Anonymous'
        )
        return response

class SiteSettingsDetailAdmin(generics.RetrieveUpdateDestroyAPIView):
    queryset = SiteSettings.objects.all()
    serializer_class = SiteSettingsSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        setting = self.get_object()
        ActivityLog.objects.create(
            action=ActivityLog.ActionType.UPDATE,
            content_type=ActivityLog.ContentType.SETTING,
            object_id=setting.id,
            object_name=setting.key,
            description=f"Updated setting: {setting.key}",
            user=request.user.username if request.user.is_authenticated else 'Anonymous'
        )
        return response

class SiteInfoListAdmin(generics.ListCreateAPIView):
    queryset = SiteInfo.objects.all()
    serializer_class = SiteInfoSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        ActivityLog.objects.create(
            action=ActivityLog.ActionType.CREATE,
            content_type="siteinfo",
            object_id=response.data.get('id'),
            object_name=response.data.get('name'),
            description=f"Created site info: {response.data.get('name')}",
            user=request.user.username if request.user.is_authenticated else 'Anonymous'
        )
        return response

class SiteInfoDetailAdmin(generics.RetrieveUpdateDestroyAPIView):
    queryset = SiteInfo.objects.all()
    serializer_class = SiteInfoSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        info = self.get_object()
        ActivityLog.objects.create(
            action=ActivityLog.ActionType.UPDATE,
            content_type="siteinfo",
            object_id=info.id,
            object_name=info.name,
            description=f"Updated site info: {info.name}",
            user=request.user.username if request.user.is_authenticated else 'Anonymous'
        )
        return response

    def destroy(self, request, *args, **kwargs):
        info = self.get_object()
        ActivityLog.objects.create(
            action=ActivityLog.ActionType.DELETE,
            content_type="siteinfo",
            object_id=info.id,
            object_name=info.name,
            description=f"Deleted site info: {info.name}",
            user=request.user.username if request.user.is_authenticated else 'Anonymous'
        )
        return super().destroy(request, *args, **kwargs)

def spa(request, path=""):
    """Serve the React app for its client-side routes. Unknown paths get the same shell with a real 404 status."""
    index = settings.FRONTEND_DIST / "index.html"
    if not index.exists():
        raise Http404("Frontend not built")
    return FileResponse(open(index, "rb"), content_type="text/html", status=200 if path.strip("/") in KNOWN_ROUTES else 404)

class MediaFileListAdmin(generics.ListCreateAPIView):
    queryset = MediaFile.objects.all()
    serializer_class = MediaFileSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Get file info
        filename = uploaded_file.name
        file_size = uploaded_file.size
        file_type = uploaded_file.content_type or 'application/octet-stream'

        # Categorize file type
        if file_type.startswith('image/'):
            file_type = 'image'
        elif file_type.startswith('video/'):
            file_type = 'video'
        elif file_type.startswith('audio/'):
            file_type = 'audio'
        elif file_type in ['application/pdf']:
            file_type = 'document'
        else:
            file_type = 'file'

        media_file = MediaFile.objects.create(
            file=uploaded_file,
            filename=filename,
            file_type=file_type,
            file_size=file_size,
            uploaded_by=request.user.username if request.user.is_authenticated else 'Anonymous',
            alt_text=request.data.get('alt_text', ''),
            description=request.data.get('description', '')
        )

        ActivityLog.objects.create(
            action=ActivityLog.ActionType.CREATE,
            content_type="media",
            object_id=media_file.id,
            object_name=filename,
            description=f"Uploaded media file: {filename}",
            user=request.user.username if request.user.is_authenticated else 'Anonymous'
        )

        serializer = self.get_serializer(media_file)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class MediaFileDetailAdmin(generics.RetrieveUpdateDestroyAPIView):
    queryset = MediaFile.objects.all()
    serializer_class = MediaFileSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        media_file = self.get_object()
        ActivityLog.objects.create(
            action=ActivityLog.ActionType.UPDATE,
            content_type="media",
            object_id=media_file.id,
            object_name=media_file.filename,
            description=f"Updated media file: {media_file.filename}",
            user=request.user.username if request.user.is_authenticated else 'Anonymous'
        )
        return response

    def destroy(self, request, *args, **kwargs):
        media_file = self.get_object()
        filename = media_file.filename
        media_file.file.delete(save=False)  # Delete the actual file
        ActivityLog.objects.create(
            action=ActivityLog.ActionType.DELETE,
            content_type="media",
            object_id=media_file.id,
            object_name=filename,
            description=f"Deleted media file: {filename}",
            user=request.user.username if request.user.is_authenticated else 'Anonymous'
        )
        return super().destroy(request, *args, **kwargs)
