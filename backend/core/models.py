from django.db import models

class Cluster(models.Model):
    order = models.PositiveSmallIntegerField(default=0)
    name = models.CharField(max_length=120)
    short_name = models.CharField(max_length=60, help_text="Filter chip label")
    slug = models.SlugField(unique=True)
    class Meta: ordering = ["order"]
    def __str__(self): return self.name

class Desk(models.Model):
    cluster = models.ForeignKey(Cluster, related_name="desks", on_delete=models.CASCADE)
    order = models.PositiveSmallIntegerField(default=0)
    code = models.CharField(max_length=8, unique=True)
    name = models.CharField(max_length=120, help_text="Without 'Brokerage Division'")
    slug = models.SlugField(unique=True)
    strapline = models.CharField(max_length=240, blank=True)
    description = models.TextField(blank=True)
    focus_areas = models.JSONField(default=list, blank=True)
    class Meta: ordering = ["cluster__order", "order"]
    def __str__(self): return f"{self.code} {self.name}"

class Person(models.Model):
    class Kind(models.TextChoices):
        DIRECTOR = "director"; ADVISER = "adviser"
    kind = models.CharField(max_length=10, choices=Kind.choices)
    order = models.PositiveSmallIntegerField(default=0)
    name = models.CharField(max_length=160)
    role = models.CharField(max_length=160, blank=True)
    qualifications = models.CharField(max_length=240, blank=True)
    portfolio = models.CharField(max_length=240, blank=True)
    profile = models.TextField(blank=True)
    photo = models.ImageField(upload_to="people/", blank=True)
    published = models.BooleanField(default=True)
    class Meta: ordering = ["kind", "order", "name"]
    def __str__(self): return self.name

class Enquiry(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=160)
    contact = models.CharField(max_length=200, help_text="Email or phone")
    desk = models.ForeignKey(Desk, null=True, blank=True, on_delete=models.SET_NULL)
    message = models.TextField(max_length=4000)
    handled = models.BooleanField(default=False)
    class Meta: ordering = ["-created"]; verbose_name_plural = "enquiries"
    def __str__(self): return f"{self.name} ({self.created:%d %b %Y})"

class ActivityLog(models.Model):
    class ActionType(models.TextChoices):
        CREATE = "create"
        UPDATE = "update"
        DELETE = "delete"
        VIEW = "view"

    class ContentType(models.TextChoices):
        DESK = "desk"
        PERSON = "person"
        ENQUIRY = "enquiry"
        CLUSTER = "cluster"
        CONTENT = "content"
        SETTING = "setting"

    timestamp = models.DateTimeField(auto_now_add=True)
    action = models.CharField(max_length=10, choices=ActionType.choices)
    content_type = models.CharField(max_length=10, choices=ContentType.choices)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    object_name = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    user = models.CharField(max_length=150, blank=True)

    class Meta:
        ordering = ["-timestamp"]
        verbose_name = "activity log"
        verbose_name_plural = "activity logs"

    def __str__(self):
        return f"{self.get_action_display()} {self.get_content_type_display()} - {self.object_name or self.object_id}"

class SiteContent(models.Model):
    """Store editable static content sections"""
    section = models.CharField(max_length=100, unique=True)
    key = models.CharField(max_length=100)
    value = models.TextField(blank=True)
    value_type = models.CharField(
        max_length=20,
        choices=[
            ("text", "Text"),
            ("html", "HTML"),
            ("json", "JSON"),
            ("number", "Number"),
        ],
        default="text"
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["section", "key"]
        ordering = ["section", "key"]
        verbose_name = "site content"
        verbose_name_plural = "site content"

    def __str__(self):
        return f"{self.section}.{self.key}"

class SiteSettings(models.Model):
    """Global site settings"""
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField(blank=True)
    value_type = models.CharField(
        max_length=20,
        choices=[
            ("text", "Text"),
            ("email", "Email"),
            ("url", "URL"),
            ("number", "Number"),
            ("boolean", "Boolean"),
            ("json", "JSON"),
        ],
        default="text"
    )
    description = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["key"]
        verbose_name = "site setting"
        verbose_name_plural = "site settings"

    def __str__(self):
        return self.key
