import json
from pathlib import Path
from django.core.files import File
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from core.models import Cluster, Desk, Person

FIX = Path(__file__).resolve().parents[2] / "fixtures"
clean = lambda v: "" if "to be confirmed" in v.lower() else v

class Command(BaseCommand):
    help = "Load the approved site content. Safe to re-run: existing records are left alone so admin edits survive."
    def add_arguments(self, p):
        p.add_argument("--force", action="store_true", help="Overwrite existing desks and people with the original content (discards admin edits)")
    def handle(self, *a, force=False, **k):
        d = json.loads((FIX / "tbb_content.json").read_text()); cl = {}; made = {"desks": 0, "people": 0}
        for i, (key, short) in enumerate(d["clusters"].items(), 1):
            cl[key], _ = Cluster.objects.update_or_create(slug=key, defaults={"order": i, "short_name": short, "name": d["cluster_full"][key]})
        n = {}
        for x in d["desks"]:
            n[x["cluster"]] = n.get(x["cluster"], 0) + 1
            vals = dict(cluster=cl[x["cluster"]], order=n[x["cluster"]], name=x["name"], slug=slugify(x["name"])[:50],
                        strapline=x["strapline"], description=x["description"], focus_areas=x["focus_areas"])
            if force: Desk.objects.update_or_create(code=x["code"], defaults=vals); made["desks"] += 1
            else: made["desks"] += Desk.objects.get_or_create(code=x["code"], defaults=vals)[1]
        for p in d["directors"] + d["advisers"]:
            vals = dict(order=p["order"], role=p["portfolio"] if p["kind"] == "director" else "", qualifications=clean(p["qualifications"]),
                        portfolio=p["portfolio"] if p["kind"] == "adviser" else "", profile=p["profile"])
            obj, created = Person.objects.get_or_create(kind=p["kind"], name=p["name"], defaults=vals)
            if not created and force:
                for f, v in vals.items(): setattr(obj, f, v)
                obj.save()
            if (created or force) and p["photo"] and (FIX / p["photo"]).exists():
                with open(FIX / p["photo"], "rb") as fh: obj.photo.save(Path(p["photo"]).name, File(fh), save=True)
            made["people"] += created
        self.stdout.write(self.style.SUCCESS(f"Created {made['desks']} desks and {made['people']} people (existing records {'overwritten' if force else 'kept'})."))
