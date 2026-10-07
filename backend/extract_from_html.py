"""One-off: pull approved content out of TBB_Website.html into a JSON fixture + adviser photos."""
import base64, json, re, sys
from pathlib import Path
from bs4 import BeautifulSoup
src = Path(sys.argv[1]); out = Path(__file__).parent
soup = BeautifulSoup(src.read_text(encoding="utf-8"), "lxml")
t = lambda n: re.sub(r"\s+", " ", n.get_text(" ", strip=True)) if n else ""

clusters = {}
for b in soup.select(".chip[data-filter]"):
    if b["data-filter"] != "all": clusters[b["data-filter"]] = t(b)
cluster_full = {}
desks = []
for a in soup.select("article.desk"):
    key = a["data-cluster"]; full = t(a.select_one(".desk__cluster")); cluster_full[key] = full
    desks.append(dict(code=t(a.select_one(".desk__code")), name=t(a.select_one(".desk__name")), cluster=key,
        strapline=t(a.select_one(".desk__strap")), description=t(a.select_one(".desk__body")),
        focus_areas=[t(li) for li in a.select(".desk__more li")]))

def person(card, kind, order, photo_dir=None):
    d = dict(kind=kind, order=order, name=t(card.select_one("h3")), qualifications=t(card.select_one(".quals")),
             portfolio=t(card.select_one(".port")), profile=t(card.select_one(".bio")), photo="")
    img = card.select_one("img")
    if img and photo_dir and img["src"].startswith("data:image"):
        head, data = img["src"].split(",", 1); ext = "jpg" if "jpeg" in head else "png"
        fn = re.sub(r"[^a-z0-9]+", "-", d["name"].lower()).strip("-") + "." + ext
        (photo_dir / fn).write_bytes(base64.b64decode(data)); d["photo"] = f"people/{fn}"
    return d

net = soup.select_one("#network"); pd = out / "media" / "people"; pd.mkdir(parents=True, exist_ok=True)
advisers = [person(c, "adviser", i, pd) for i, c in enumerate(net.select("article.card"), 1)]
directors = [person(c, "director", i) for i, c in enumerate(soup.select("#people article.card"), 1)]
for d in directors:
    m = next((a for a in advisers if a["name"] == d["name"]), None)
    if m: d["photo"] = m["photo"]
particulars = {t(li.select_one("b")): t(li.select_one("span")) for li in soup.select("#people .facts li")}
init = soup.select_one("#initiatives")
def table(tb): return [[t(c) for c in r.select("td")] for r in tb.select("tbody tr")]
tabs = init.select("table.tiers")
static = dict(
  philosophy=[[t(li.select_one("h4")), t(li.select_one("p"))] for li in soup.select("ol.beliefs li")],
  standards_lede=t(soup.select_one("#standards .lede")),
  standards=[t(li) for li in soup.select("#standards li")],
  network_lede=t(net.select_one(".lede")),
  associates_lede=t(soup.select_one("#associates").find_next("p")),
  associates=[t(li) for li in soup.select("ul.disciplines li")],
  associates_cta=t(soup.select_one("ul.disciplines").find_next_sibling("p")),
  initiatives_lede=t(init.select_one(".lede")),
  institute=dict(name=t(init.select_one("#institute .init__name")), strap=t(init.select_one("#institute .init__strap")),
     paras=[t(p) for p in init.select("#institute > p") if "init__strap" not in (p.get("class") or []) and "status" not in (p.get("class") or [])][:2],
     offers=[[t(li.select_one("h4")), t(li.select_one("p"))] for li in init.select("#institute .offers li")],
     grades=table(tabs[0]), faculties=table(tabs[1]), status=t(init.select_one("#institute .status")),
     faculties_intro=t(tabs[1].find_previous_sibling("p"))),
  summit=dict(name=t(init.select_one("#summit .init__name")), strap=t(init.select_one("#summit .init__strap")),
     intro=t(init.select_one("#summit > p:not(.init__strap)")), body=t(init.select_one(".summit__main > p")),
     who=t(init.select_one(".summit__main p:nth-of-type(2)")), themes=[t(li) for li in init.select(".themes li")],
     facts=[[t(dt), t(dd)] for dt, dd in zip(init.select(".summit__side dt"), init.select(".summit__side dd"))]),
  people_lede=t(soup.select_one("#people .lede")), particulars=particulars)
(out / "core/fixtures").mkdir(exist_ok=True)
(out / "core/fixtures/tbb_content.json").write_text(json.dumps(dict(clusters=clusters, cluster_full=cluster_full, desks=desks, advisers=advisers, directors=directors), indent=1, ensure_ascii=False))
(out.parent / "frontend/src/data/static.json").write_text(json.dumps(static, indent=1, ensure_ascii=False))
print(len(desks), "desks;", len(advisers), "advisers;", len(directors), "directors;", len(list(pd.iterdir())), "photos")
print(json.dumps(static["institute"]["paras"])[:200]); print(particulars); print(static["summit"]["who"][:80], "|", len(static["associates"]), "associates")
