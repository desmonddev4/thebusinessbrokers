from rest_framework import serializers
from django.db.models import Max
from .models import Cluster, Desk, Person, Enquiry

class DeskSerializer(serializers.ModelSerializer):
    cluster = serializers.SlugRelatedField(slug_field="slug", read_only=True)
    cluster_name = serializers.CharField(source="cluster.name", read_only=True)
    class Meta:
        model = Desk
        fields = ["code","name","slug","strapline","description","focus_areas","cluster","cluster_name"]

class ClusterSerializer(serializers.ModelSerializer):
    desk_count = serializers.IntegerField(source="desks.count", read_only=True)
    class Meta: model = Cluster; fields = ["slug","name","short_name","desk_count"]

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
