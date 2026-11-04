# Writes story.json for dh008 (the HUD ladder is generated from SAY, which shots.js + make_cues.py mirror).
import json, pathlib
HERE = pathlib.Path(__file__).resolve().parent
# (time of the "6-7", count, dB, HUD comparison line) — +10 dB ≈ twice as loud (perceived)
SAY = [(6.0, 1, 30, "= A WHISPER"), (9.5, 2, 40, "= A LIBRARY"), (11.5, 3, 50, "= A QUIET OFFICE"), (14.0, 4, 60, "= A CONVERSATION"),
       (16.0, 5, 70, "= A VACUUM CLEANER"), (19.5, 6, 80, "= A BLENDER"), (21.5, 7, 90, "= A LAWNMOWER"), (25.5, 8, 100, "= A MOTORCYCLE"),
       (30.0, 9, 110, "= A ROCK CONCERT"), (31.5, 10, 120, "= A THUNDERCLAP"), (33.0, 11, 130, "PAIN STARTS ≈ 120–130 dB"),
       (36.5, 12, 140, "= A JET ENGINE, 30 m AWAY"), (38.0, 13, 150, "4,096× THE WHISPER"), (39.5, 14, 160, "GLASS BREAKS ≈ 160 dB (ROUGHLY)"),
       (44.0, 15, 170, "KRAKATOA 1883 · 172 dB, 160 km AWAY"), (47.5, 16, 180, "32,768× THE WHISPER"), (52.5, 17, 190, "65,536× THE WHISPER"),
       (54.5, 18, 200, "LIMIT IN AIR ≈ 194 dB")]
SILENCE, LAST = 57.0, (61.0, 19, 210, "THE MOON FELT THAT")
DUR, END_IN = 70.0, 66.0
MOON_HIT, SUN_HIT = 62.95, 64.75                                   # mirrors shots.js

def hud():
    segs = [{"t0": 0.0, "t1": SAY[0][0] - 0.05, "from": 20, "to": 20, "time": "\"6-7\" #0", "age": "= A QUIET ROOM"}]
    prev = 20
    for k, (t, n, db, cmp) in enumerate(SAY):
        t1 = SAY[k + 1][0] - 0.05 if k + 1 < len(SAY) else SILENCE
        segs.append({"t0": t - 0.05, "t1": t1, "from": prev, "to": db, "r0": t, "r1": t + 0.35, "time": f"\"6-7\" #{n}", "age": cmp})
        prev = db
    segs.append({"t0": SILENCE, "t1": LAST[0] - 0.05, "from": prev, "to": 0, "r0": SILENCE, "r1": SILENCE + 0.6, "time": "+1 DAY", "age": "8 BILLION PEOPLE · SILENT"})
    t, n, db, cmp = LAST
    segs.append({"t0": t - 0.05, "t1": MOON_HIT, "from": 0, "to": db, "r0": t, "r1": t + 0.35, "time": f"\"6-7\" #{n}", "age": cmp})
    segs.append({"t0": MOON_HIT, "t1": SUN_HIT, "from": db, "to": db, "time": f"\"6-7\" #{n}", "age": "MOONS LEFT · 0", "ageGoldAt": MOON_HIT})
    segs.append({"t0": SUN_HIT, "t1": DUR, "from": db, "to": db, "time": f"\"6-7\" #{n}", "age": "SUNS LEFT · 0", "ageGoldAt": SUN_HIT})
    return segs

story = {
    "tone": "funny",
    "look": {"exposure": 1.05, "fill": 0.5, "vignette": 0.24, "bloom": 0.22, "bloomThreshold": 0.92},
    "fps": 30, "duration": DUR,
    "title": {"html": "What if every “6-7” got <em>twice as loud</em>?", "in": -0.4, "out": 3.2},
    "subs": [
        [3.45, 5.4, "Room 4. Page 67."],
        [5.6, 8.6, "Leo whispers it. Every repeat: twice as loud."],
        [8.95, 11.3, "#2: 40 dB. The coffee notices."],
        [11.5, 13.15, "#3: it wants out."],
        [13.4, 15.6, "Then the whole class joins in."],
        [15.8, 18.45, "#5 is already 16 times the whisper."],
        [18.8, 21.3, "Recess. The whole school does the hands."],
        [21.6, 24.05, "Even the seesaw."],
        [24.4, 26.6, "Adults are not immune."],
        [26.8, 29.25, "#8 sets off every car alarm in town."],
        [29.6, 32.0, "60,000 fans hear it. They say it back."],
        [32.2, 35.6, "#11: 130 dB. Past the threshold of pain."],
        [36.0, 38.4, "#12: as loud as a jet engine."],
        [38.6, 41.0, "#14: glass gives up."],
        [41.4, 43.6, "The seismograph picks up a signal."],
        [43.8, 46.4, "The scientist reads it out loud."],
        [46.8, 49.2, "#16: the parrot learned it."],
        [49.4, 51.45, "Every bird faints. They're fine."],
        [51.8, 54.2, "Krakatoa was heard 4,800 km away."],
        [54.5, 56.85, "Past 194 dB, sound becomes a shockwave."],
        [57.2, 59.4, "+1 day. Earth agrees: never again."],
        [62.55, 63.95, "Goodbye, Moon."],
        [64.15, 65.8, "Then the Sun."],
    ],
    "hudLabel": "LOUDNESS", "hudSuffix": " dB",
    "hud": hud(),
    "end": {"in": END_IN, "html": "Could <em>you</em> go one day without saying it?", "small": "TELL US BELOW"},
    "dips": [], "finalFade": [END_IN - 0.6, END_IN],
    "debugView": {"center": [0, 0, 0], "height": 12},
}
(HERE / "story.json").write_text(json.dumps(story, indent=1, ensure_ascii=False) + "\n")
print("story.json:", len(story["subs"]), "subs,", len(story["hud"]), "HUD segments")
