from rest_framework import serializers
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
