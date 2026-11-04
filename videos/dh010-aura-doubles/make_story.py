# Writes story.json for dh010. The ladder (shot starts, days) mirrors shots.js SHOTS/TIMES; aura on day n = 2^(n-1).
import json, pathlib
HERE = pathlib.Path(__file__).resolve().parent
GLOW_ON, FREEZE, DUR, END_IN = 6.3, 54.05, 69.0, 64.6
# (t0 of the HUD step, day, stat line) — the number rolls to 2^(day-1) over 0.5 s
LADDER = [
    (0.0, 1, "CATS IMPRESSED · 0"),
    (GLOW_ON, 2, "“AURA POINTS” WENT VIRAL ON TIKTOK · 2024"),
    (10.6, 5, "WIND SPEED INDOORS · 31 km/h"),
    (15.4, 8, "SUNGLASSES · NOT HIS"),
    (20.2, 11, "OXFORD 2025 SHORTLIST · “AURA FARMING”"),
    (25.4, 14, "GREEN LIGHTS IN A ROW · 14"),
    (30.4, 17, "A NORMAL STADIUM WAVE · 12 m/s"),
    (35.6, 21, "FLIGHTS REROUTED · ALL OF THEM"),
    (40.6, 26, "HIS GLOW REACHES THE MOON IN 1.3 s"),
    (45.6, 31, "THE SUN · 3.828 × 10²⁶ WATTS"),
    (50.8, 31, "DAY 31 = 2³⁰ AURA"),
]

def hud():
    segs, prev = [], 1
    for k, (t0, day, stat) in enumerate(LADDER):
        t1 = LADDER[k + 1][0] if k + 1 < len(LADDER) else FREEZE
        n = 2 ** (day - 1)
        s = {"t0": t0, "t1": t1, "from": prev, "to": n, "time": f"DAY {day}", "age": stat}
        if n != prev: s.update({"r0": t0 + (0.05 if t0 else 0), "r1": t0 + 0.55})
        if day == 31 and t0 == 45.6: s["ageGoldAt"] = 45.65
        segs.append(s); prev = n
    # the wave back: −∞ in one frame (a literal: JSON has no Infinity), red, and it stays −∞ (−∞ × 2 = −∞)
    neg = {"from": 0, "to": 0, "text": "−∞", "numColor": "#ff6a5a"}
    segs.append({"t0": FREEZE, "t1": 56.4, **neg, "time": "DAY 31", "age": "WHO SHE WAS WAVING AT · THE MAILMAN"})
    segs.append({"t0": 56.4, "t1": 60.4, **neg, "time": "DAY 32", "age": "−∞ × 2 = −∞"})
    segs.append({"t0": 60.4, "t1": DUR, **neg, "time": "DAY 33", "age": "−∞ × 2 = −∞"})
    return segs

story = {
    "tone": "funny",
    "look": {"exposure": 1.05, "fill": 0.5, "vignette": 0.22, "bloom": 0.24, "bloomThreshold": 0.9},
    "fps": 30, "duration": DUR,
    "title": {"html": "What if your aura <em>doubled</em> every day?", "in": -0.4, "out": 3.2},
    "subs": [
        [3.45, 5.85, "Day 1. Todd has exactly one aura."],
        [6.5, 8.55, "Every day, his aura doubles."],
        [8.75, 10.45, "Day 2: a faint glow."],
        [10.8, 13.0, "Day 5: 16 aura. Wind. Indoors."],
        [13.2, 15.3, "The coffee pours itself. The cat salutes."],
        [15.6, 17.9, "Day 8: sunglasses arrive from nowhere."],
        [18.1, 20.05, "He walks in slow motion now."],
        [20.4, 22.75, "Day 11: 1,024 aura."],
        [22.9, 25.3, "The whole office stands up. Nobody knows why."],
        [25.5, 27.95, "Day 14: every light turns green for him."],
        [28.15, 30.25, "The pigeons fly in formation."],
        [30.6, 33.0, "Day 17: the stadium does the wave."],
        [33.2, 35.45, "For him. Five times faster than normal."],
        [35.8, 38.2, "Day 21: a million aura."],
        [38.4, 40.45, "Planes have to fly around him."],
        [40.8, 43.1, "Day 26: visible from space."],
        [43.3, 45.45, "The Moon now reflects Todd."],
        [45.8, 48.2, "Day 31: a billion. Brighter than the Sun."],
        [48.4, 50.65, "The Sun puts on sunglasses."],
        [51.0, 53.0, "Peak aura. A neighbor waves."],
        [54.2, 56.25, "She was not waving at him."],
        [56.6, 58.4, "Day 32: negative infinity aura."],
        [58.6, 60.25, "It has its own gravity."],
        [60.6, 62.45, "Day 33: it eats the Moon."],
        [62.6, 64.4, "Then the Sun. Sunglasses and all."],
    ],
    "hudLabel": "AURA",
    "hud": hud(),
    "end": {"in": END_IN, "html": "What's the most <em>aura</em> you've ever lost?", "small": "TELL US BELOW"},
    "dips": [], "finalFade": [END_IN - 0.6, END_IN],
    "debugView": {"center": [0, 0, 0], "height": 12},
}
(HERE / "story.json").write_text(json.dumps(story, indent=1, ensure_ascii=False) + "\n")
print("story.json:", len(story["subs"]), "subs,", len(story["hud"]), "HUD segments")
