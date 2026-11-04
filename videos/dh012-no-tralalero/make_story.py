"""Writes story.json for dh012 (text layer: title, HUD ladder, subtitles, end card). Run: python3 -I videos/dh012-no-tralalero/make_story.py"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
subs = [
 [3.5, 5.3, "Second 0. Tralalero Tralala is erased."],
 [5.45, 7.85, "He was patient zero of Italian brainrot."],
 [8.1, 10.6, "+1 second. Everything that came after him…"],
 [10.8, 13.2, "…goes with him. Domino by domino."],
 [13.45, 16.2, "+1 minute. Bombardiro Crocodilo is just a plane."],
 [16.4, 18.8, "And one very confused crocodile."],
 [19.1, 21.4, "+1 hour. Sneakers were sold in threes."],
 [21.7, 24.2, "Nobody needs a third shoe anymore."],
 [24.45, 26.95, "+1 day. The fan club still poses."],
 [27.1, 29.6, "It needed the third leg."],
 [29.85, 32.85, "+1 week. The internet tries to make a new one."],
 [32.95, 35.6, "It gets worse."],
 [35.85, 38.3, "+1 month. His sneakers are still there."],
 [38.45, 40.6, "So they go looking for him."],
 [40.9, 43.2, "+2 months. They try a real shark."],
 [43.5, 45.65, "Sharks have no legs. Never had."],
 [45.9, 48.45, "+11 months. They keep walking."],
 [48.7, 51.0, "+1 year. Low tide in Australia."],
 [51.25, 53.4, "Some sharks really do walk."],
 [53.55, 55.55, "Nine kinds. One wears sneakers now."],
 [55.75, 58.0, "He doesn't know he's a meme."],
 [58.3, 60.6, "…yet."],
]
def seg(t0, t1, a, b, time, age, r=None, **kw):
    d = {"t0": t0, "t1": t1, "from": a, "to": b, "dec": 0, "time": time, "age": age}
    if r: d["r0"], d["r1"] = r
    d.update(kw)
    return d
hud = [
 seg(0.0, 8.0, 4812, 4811, "SECOND 0", "FIRST VIRAL VIDEO · JAN 13, 2025 · 7 M PLAYS", (4.6, 5.0)),
 seg(8.0, 13.4, 4811, 1206, "+1 SECOND", "HE CAME FIRST · THE REST CAME AFTER", (8.6, 11.8)),
 seg(13.4, 19.0, 1206, 1205, "+1 MINUTE", "BOMBARDIRO CROCODILO · SINCE FEB 2025", (14.15, 14.5)),
 seg(19.0, 24.4, 1205, 311, "+1 HOUR", "SHOES MADE IN 2024 · 23.9 BILLION PAIRS", (19.6, 23.6)),
 seg(24.4, 29.8, 311, 12, "+1 DAY", "THIRD LEGS LEFT ON EARTH · 0", (27.25, 28.2)),
 seg(29.8, 30.5, 12, 0, "+1 WEEK", "NEW ONES THAT WORKED · 0", (29.85, 30.35)),
 seg(30.5, 31.35, 0, 1, "+1 WEEK", "NEW ONES THAT WORKED · 0", (30.55, 30.75)),
 seg(31.35, 31.8, 1, 0, "+1 WEEK", "NEW ONES THAT WORKED · 0", (31.4, 31.6)),
 seg(31.8, 32.6, 0, 1, "+1 WEEK", "NEW ONES THAT WORKED · 0", (31.85, 32.05)),
 seg(32.6, 33.3, 1, 0, "+1 WEEK", "NEW ONES THAT WORKED · 0", (32.65, 32.85)),
 seg(33.3, 34.65, 0, 1, "+1 WEEK", "NEW ONES THAT WORKED · 0", (33.35, 33.55)),
 seg(34.65, 35.8, 1, 0, "+1 WEEK", "NEW ONES THAT WORKED · 0", (34.7, 34.9)),
 seg(35.8, 40.8, 0, 0, "+1 MONTH", "SNEAKERS STILL LOOKING FOR HIM · 3"),
 seg(40.8, 45.8, 0, 0, "+2 MONTHS", "SHARKS ~450 M YEARS · TREES ~385 M YEARS"),
 seg(45.8, 48.6, 0, 0, "+11 MONTHS", "ITALY → AUSTRALIA · ~15,000 km ON FOOT"),
 seg(48.6, 55.6, 0, 1, "+1 YEAR · LOW TIDE", "WALKING SHARK SPECIES · 9 (REAL)", (53.55, 53.85), ageGoldAt=53.6),
 seg(55.6, 65.6, 1, 1, "+1 YEAR · LOW TIDE", "SHARK SPECIES 530+ · IN SNEAKERS · 1"),
]
story = {
 "tone": "funny",
 "look": {"exposure": 1.05, "fill": 0.5, "vignette": 0.22, "bloom": 0.22, "bloomThreshold": 0.92},
 "fps": 30, "duration": 65.6,
 "title": {"html": "What if Tralalero Tralala didn't <em>exist</em>?", "in": -0.4, "out": 3.4},
 "subs": subs,
 "hudLabel": "BRAINROT CHARACTERS LEFT",
 "hud": hud,
 "end": {"in": 61.4, "html": "Was the internet better <em>without</em> him?", "small": "TELL US BELOW"},
 "dips": [],
 "finalFade": [60.8, 61.4],
 "debugView": {"center": [0, 0, 2], "height": 14},
}
json.dump(story, open(os.path.join(HERE, "story.json"), "w"), indent=1, ensure_ascii=False)
print("story.json:", len(subs), "subs,", len(hud), "hud segments")
