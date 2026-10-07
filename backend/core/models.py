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
