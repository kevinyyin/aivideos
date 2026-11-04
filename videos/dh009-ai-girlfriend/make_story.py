"""Writes story.json for dh009 (text layer: title, HUD ladder, subtitles, end card). Run: python3 -I videos/dh009-ai-girlfriend/make_story.py"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
subs = [
 [3.45, 6.4, "2:14 AM. Greg texts his AI girlfriend."],
 [7.6, 9.3, "Now she's real."],
 [9.5, 11.7, "She still works exactly like the app."],
 [12.1, 14.3, "Day 2. Ask her anything…"],
 [14.5, 16.9, "…and you get a bullet-point list."],
 [17.2, 19.4, "Day 3. She doesn't carry groceries."],
 [19.6, 21.8, "Technically, she's software."],
 [22.2, 24.4, "Day 5. His job interview."],
 [24.6, 27.2, "She does whisper ASMR. Everywhere."],
 [27.6, 30.0, "His mom's birthday. She did the research."],
 [30.2, 32.8, "She's not always right. She's always sure."],
 [33.2, 35.4, "Date night. Hold her hand."],
 [35.6, 38.2, "Don't count the fingers."],
 [38.6, 40.4, "Day 8. The kiss cam."],
 [40.7, 42.9, "Then the free trial ends."],
 [43.1, 44.45, "Mid-hug."],
 [44.8, 47.2, "Overnight, she updates herself."],
 [47.4, 49.6, "Now she's in every room."],
 [50.0, 52.2, "+1 year. The servers go down."],
 [52.4, 55.2, "Every AI partner on Earth freezes."],
 [55.6, 57.7, "+3 years. The servers come back."],
 [58.0, 60.2, "Her memory doesn't."],
 [60.6, 62.6, "Then she generates a summary."],
 [62.8, 64.9, "She left him for the smart fridge."],
]
def seg(t0, t1, a, b, time, age, r=None):
    d = {"t0": t0, "t1": t1, "from": a, "to": b, "dec": 2, "time": time, "age": age}
    if r: d["r0"], d["r1"] = r
    return d
hud = [
 seg(0.0, 6.6, 0, 0, "DAY 1 · 2:14 AM", "FREE TRIAL · 7 DAYS LEFT"),
 seg(6.6, 11.8, 0, 0, "DAY 1 · 2:15 AM", "AI COMPANION APPS · 220 MILLION DOWNLOADS"),
 seg(11.8, 17.0, 0, 0, "DAY 2 · 5:30 PM", "DINNER IDEAS · 47 · DINNERS · 0"),
 seg(17.0, 22.0, 0, 0, "DAY 3 · 11:10 AM", "BAGS SHE CAN CARRY · 0"),
 seg(22.0, 27.4, 0, 0, "DAY 5 · 9:00 AM", "WHISPER VOLUME · 20 dB"),
 seg(27.4, 33.0, 0, 0, "DAY 6 · MOM'S BIRTHDAY", "CANDLES · 300 · MOM'S AGE · 61"),
 seg(33.0, 36.9, 0, 0, "DAY 7 · DATE NIGHT", "FINGERS · 5"),
 seg(36.9, 38.4, 0, 0, "DAY 7 · DATE NIGHT", "FINGERS · 11"),
 seg(38.4, 44.6, 0, 19.99, "DAY 8 · FREE TRIAL ENDS", "AI ROMANCE APPS · $162.8 M SPENT · JAN–JUN 2026", (43.0, 43.5)),
 seg(44.6, 49.8, 19.99, 59.98, "DAY 9 · UPDATE v4.0", "PENNYS · 12", (45.0, 45.6)),
 seg(49.8, 55.4, 59.98, 719.76, "+1 YEAR · SERVERS DOWN", "GEN Z SINGLES WHO'VE TRIED AI ROMANCE · 33 %", (49.9, 50.5)),
 seg(55.4, 60.4, 719.76, 2159.28, "+3 YEARS · REBOOT", "MEMORIES SAVED · 0", (55.5, 56.2)),
 seg(60.4, 69.6, 2159.28, 2159.28, "+3 YEARS · 1 DAY", "HER NEW PARTNER · THE FRIDGE"),
]
story = {
 "tone": "funny",
 "look": {"exposure": 1.05, "fill": 0.5, "vignette": 0.22, "bloom": 0.22, "bloomThreshold": 0.92},
 "fps": 30, "duration": 69.6,
 "title": {"html": "What if your AI girlfriend was <em>real</em>?", "in": -0.4, "out": 3.2},
 "hudLabel": "SPENT ON PREMIUM", "hudPrefix": "$",
 "hud": hud, "subs": subs,
 "end": {"in": 65.4, "html": "Would you date an AI if it was <em>real</em>?", "small": "TELL US BELOW"},
 "dips": [], "finalFade": [64.8, 65.4],
 "debugView": {"center": [0, 0, 0], "height": 10},
}
for a, b, s in subs:
    w = len(s.split()); assert (b - a) / w >= 0.3 or w <= 2, (s, (b - a) / w)
json.dump(story, open(os.path.join(HERE, "story.json"), "w"), indent=1, ensure_ascii=False)
print("story.json written")
