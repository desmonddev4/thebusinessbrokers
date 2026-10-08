from rest_framework import serializers
from django.db.models import Max
from .models import Cluster, Desk, Person, Enquiry, ActivityLog, SiteContent, SiteSettings
# SiteInfo and MediaFile temporarily commented out until migrations run
# from .models import SiteInfo, MediaFile

class DeskSerializer(serializers.ModelSerializer):
    cluster = serializers.SlugRelatedField(slug_field="slug", read_only=True)
    cluster_name = serializers.CharField(source="cluster.name", read_only=True)
    class Meta:
        model = Desk
        fields = ["code","name","slug","strapline","description","focus_areas","cluster","cluster_name"]

class ClusterSerializer(serializers.ModelSerializer):
    desk_count = serializers.IntegerField(source="desks.count", read_only=True)
    class Meta: model = Cluster; fields = ["id","slug","name","short_name","desk_count"]

class ClusterAdminSerializer(serializers.ModelSerializer):
    desk_count = serializers.IntegerField(source="desks.count", read_only=True)
    class Meta:
        model = Cluster
        fields = ["id", "order", "name", "short_name", "slug", "desk_count"]
        read_only_fields = ["desk_count"]

    def create(self, validated_data):
        from django.utils.text import slugify
        if 'slug' not in validated_data or not validated_data['slug']:
            validated_data['slug'] = slugify(validated_data['name'])[:50]
        return super().create(validated_data)

    def update(self, instance, validated_data):
        from django.utils.text import slugify
        if 'name' in validated_data and validated_data['name'] != instance.name:
            validated_data['slug'] = slugify(validated_data['name'])[:50]
        return super().update(instance, validated_data)

class PersonSerializer(serializers.ModelSerializer):
    photo = serializers.SerializerMethodField()
    def get_photo(self, o): return o.photo.url if o.photo else None
    class Meta: model = Person; fields = ["name","role","qualifications","portfolio","profile","photo","kind"]

class EnquirySerializer(serializers.ModelSerializer):
    desk = serializers.SlugRelatedField(slug_field="code", queryset=Desk.objects.all(), required=False, allow_null=True)
    website = serializers.CharField(write_only=True, required=False, allow_blank=True)  # honeypot
    class Meta: model = Enquiry; fields = ["name","contact","desk","message","website"]
    def validate_name(self, v):
        if len(v.strip()) < 2: raise serializers.ValidationError("Enter your name.")
        return v.strip()
    def validate_message(self, v):
        if len(v.strip()) < 10: raise serializers.ValidationError("Tell us a little more about what you are buying, selling or placing.")
        return v.strip()

# Admin serializers for full CRUD
class DeskAdminSerializer(serializers.ModelSerializer):
    cluster_name = serializers.CharField(source="cluster.name", read_only=True)
    cluster = serializers.PrimaryKeyRelatedField(queryset=Cluster.objects.all())
    class Meta:
        model = Desk
        fields = ["id", "code", "name", "slug", "strapline", "description", "focus_areas", "cluster", "cluster_name", "order"]
        read_only_fields = ["slug", "cluster_name"]

    def create(self, validated_data):
        from django.utils.text import slugify
        if 'slug' not in validated_data or not validated_data['slug']:
            validated_data['slug'] = slugify(validated_data['name'])[:50]
        return super().create(validated_data)

    def update(self, instance, validated_data):
        from django.utils.text import slugify
        if 'name' in validated_data and validated_data['name'] != instance.name:
            validated_data['slug'] = slugify(validated_data['name'])[:50]
        return super().update(instance, validated_data)

class PersonAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = ["id", "name", "kind", "role", "qualifications", "portfolio", "profile", "photo", "published", "order"]
        read_only_fields = ["order"]

    def create(self, validated_data):
        if 'order' not in validated_data:
            max_order = Person.objects.filter(kind=validated_data.get('kind')).aggregate(Max('order'))['order__max'] or 0
            validated_data['order'] = max_order + 1
        return super().create(validated_data)

class EnquiryAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enquiry
        fields = ["id", "name", "contact", "desk", "message", "handled", "created"]

class ActivityLogSerializer(serializers.ModelSerializer):
    action_display = serializers.CharField(source="get_action_display", read_only=True)
    content_type_display = serializers.CharField(source="get_content_type_display", read_only=True)

    class Meta:
        model = ActivityLog
        fields = ["id", "timestamp", "action", "action_display", "content_type", "content_type_display",
                  "object_id", "object_name", "description", "user"]

class SiteContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteContent
        fields = ["id", "section", "key", "value", "value_type", "updated_at"]

class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = ["id", "key", "value", "value_type", "description", "updated_at"]

# SiteInfoSerializer temporarily commented out until migrations run
# class SiteInfoSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = SiteInfo
#         fields = ["id", "name", "registration", "incorporated", "company_type",
#                   "address", "post", "phones", "tin", "auditors", "email", "updated_at"]

class MediaFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    file_size_display = serializers.SerializerMethodField()

    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None

    def get_file_size_display(self, obj):
        size = obj.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024:
                return f"{size:.1f} {unit}"
            size /= 1024
        return f"{size:.1f} TB"

    class Meta:
        model = MediaFile
        fields = ["id", "file", "file_url", "filename", "file_type", "file_size", "file_size_display",
                  "uploaded_at", "uploaded_by", "alt_text", "description"]
        read_only_fields = ["uploaded_at", "file_size", "file_size_display"]
