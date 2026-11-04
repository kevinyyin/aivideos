"""Writes story.json for dh011 (text layer: title, HUD ladder, subtitles, end card). Run: python3 -I videos/dh011-chud-to-chad/make_story.py"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
subs = [
 [3.45, 5.6, "3:07 AM. You, in goblin mode."],
 [5.8, 7.9, "Posture: shrimp."],
 [8.4, 10.3, "Day 1. Tip one: mewing."],
 [10.6, 13.3, "Your jaw squares off. Literally."],
 [13.8, 16.2, "Tip two: sleep eight hours."],
 [16.6, 19.3, "Tip three: stand up straight."],
 [19.8, 22.0, "+1 week. The haircut sculpts itself."],
 [22.4, 24.7, "The comb doesn't survive."],
 [25.2, 27.3, "+1 month. The gym."],
 [27.8, 30.1, "The barbell gives up first."],
 [30.6, 33.1, "+3 months. You walk in slow motion now."],
 [33.3, 35.5, "Wind from nowhere."],
 [35.9, 37.5, "Your jawline slices bread,"],
 [37.7, 39.3, "cuts ribbons,"],
 [39.5, 41.0, "splits logs."],
 [41.4, 43.4, "+6 months. You mog people now."],
 [43.7, 46.3, "Anyone next to you shrinks."],
 [46.7, 48.3, "You mog a statue."],
 [48.5, 50.2, "A mountain."],
 [50.5, 52.0, "The Moon hides."],
 [52.3, 53.85, "The Sun sets early."],
 [54.2, 56.3, "+1 year. Finally: a mirror."],
 [56.6, 59.3, "Every mirror on Earth shatters."],
 [59.8, 62.1, "Only one reflection left."],
 [62.5, 65.0, "The chair was waiting."],
]
def seg(t0, t1, a, b, time, age, r=None, **kw):
    d = {"t0": t0, "t1": t1, "from": a, "to": b, "dec": 0, "time": time, "age": age}
    if r: d["r0"], d["r1"] = r
    d.update(kw)
    return d
CH, MOG = {"label": "CHAD LEVEL", "suffix": "%"}, {"label": "MOG RADIUS"}
hud = [
 seg(0.0, 8.2, 2, 2, "DAY 1 · 3:07 AM", "GOBLIN MODE · OXFORD WORD OF THE YEAR 2022", **CH),
 seg(8.2, 13.6, 2, 18, "DAY 1 · 3:09 AM", "MASSETER · YOUR STRONGEST MUSCLE (GUINNESS)", (9.2, 11.8), **CH),
 seg(13.6, 16.4, 18, 30, "DAY 2 · 8 HOURS LATER", "1 IN 3 US ADULTS SLEEPS UNDER 7 HOURS (CDC)", (14.4, 16.0), **CH),
 seg(16.4, 19.6, 30, 45, "DAY 2 · 11:13 AM", "HEIGHT · +30 cm", (17.3, 18.5), **CH),
 seg(19.6, 25.0, 45, 62, "+1 WEEK", "COMBS BROKEN · 1", (20.5, 21.6), **CH),
 seg(25.0, 30.4, 62, 78, "+1 MONTH", "BARBELLS BENT · 2", (26.2, 28.9), **CH),
 seg(30.4, 35.8, 78, 90, "+3 MONTHS", "ACTUAL WIND · 0 km/h", (31.0, 35.0), **CH),
 seg(35.8, 41.2, 90, 100, "+4 MONTHS", "JAWLINE · 90.0° EXACTLY", (36.5, 40.3), ageGoldAt=40.3, **CH),
 seg(41.2, 46.6, 0, 17, "+6 MONTHS", "PEOPLE MOGGED ON THIS TRAIN · 9", (42.4, 45.2), suffix=" m", **MOG),
 seg(46.6, 48.4, 17, 40, "+9 MONTHS", "STATUES MOGGED · 1", (47.3, 47.8), suffix=" m", **MOG),
 seg(48.4, 50.4, 40, 12000, "+9 MONTHS", "MOUNTAINS MOGGED · 1", (48.85, 49.85), suffix=" m", **MOG),
 seg(50.4, 52.2, 12, 384400, "+10 MONTHS", "EARTH TO MOON · 384,400 km (NASA)", (50.6, 51.8), suffix=" km", **MOG),
 seg(52.2, 54.0, 384400, 149600000, "+11 MONTHS · 4:12 PM", "EARTH TO SUN · 149.6 MILLION km (NASA)", (52.4, 53.6), suffix=" km", **MOG),
 seg(54.0, 56.4, 149600000, 149600000, "+1 YEAR", "MIRRORS YOU OWN · 1", suffix=" km", **MOG),
 seg(56.4, 59.6, 1000000000, 0, "+1 YEAR", "(WE DIDN'T COUNT THEM)", (56.5, 59.2), linear=True, label="MIRRORS LEFT ON EARTH"),
 seg(59.6, 62.8, 100, 100, "+1 YEAR · 3:07 AM", "MIRRORS LEFT ON EARTH · 0", **CH),
 seg(62.8, 69.6, 100, 2, "+1 YEAR · 3:08 AM", "GOBLIN MODE · RESTORED", (62.9, 63.8), **CH),
]
story = {
 "tone": "funny",
 "look": {"exposure": 1.05, "fill": 0.5, "vignette": 0.22, "bloom": 0.22, "bloomThreshold": 0.92},
 "fps": 30, "duration": 69.6,
 "title": {"html": "What if you went from chud to <em>chad</em>?", "in": -0.4, "out": 3.2},
 "hudLabel": "CHAD LEVEL",
 "hud": hud, "subs": subs,
 "end": {"in": 65.6, "html": "Chud or Chad: who has more <em>fun</em>?", "small": "TELL US BELOW"},
 "dips": [], "finalFade": [65.0, 65.6],
 "debugView": {"center": [0, 0, 0], "height": 10},
}
for a, b, s in subs:
    w = len(s.split()); assert (b - a) / w >= 0.3 or w <= 2, (s, (b - a) / w)
for h in hud:
    assert len(h["age"]) <= 46, h["age"]
json.dump(story, open(os.path.join(HERE, "story.json"), "w"), indent=1, ensure_ascii=False)
print("story.json written")
