# Generates cues.json for dh016 (narrated cartoon explainer: the Leaning Tower saved by digging under it).
# Run: python3 -I videos/dh016-pisa-dig/make_cues.py   (then python3 -I audio/synth.py dh016-pisa-dig)
#
# Sound identity: "TUSCAN CLOCKWORK". The hook (0-5 s) is the piazza only: a tourist murmur, the auger grinding, dirt
# pouring into a bucket. The score ENTERS on "over." with a soft boom: 4/4 at 104 bpm, a mandolin arpeggio ostinato
# (eighth notes, tremolo on the long notes) over a plucked bass (root on 1, fifth on 3) and a soft string pad. D minor
# for every fix that made it worse, a march tom under the war, hushed tremolo bars for the frozen night and the question,
# F major from the reveal, D major for the payoff. Booms on the lurches. Different from dh012's 6/8 beach tarantella
# (no reed pads, no guitar oom-pa) and dh014's brass march. The narration (make_voice.py -> timeline.json) is its own
# stem; music + ambience duck under it. Picture times come from cut.js (the same table shots.js uses).
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, "timeline.json")))
LINES = TL["lines"]
CUT = json.loads(open(os.path.join(HERE, "cut.js")).read().split("export const CUT = ", 1)[1].rstrip().rstrip(";"))
D = json.load(open(os.path.join(HERE, "story.json")))["duration"]
for i, e in enumerate(CUT): e["t1"] = CUT[i + 1]["t0"] if i + 1 < len(CUT) else D
SH = {e["shot"]: (e["t0"], e["t1"]) for e in CUT}
def nw(lid, i):   # start of word i of line lid (video time)
    a, b = LINES[lid]; return [w[0] for w in TL["words"] if a - 0.01 <= w[0] < b + 0.01][i]

BEAT = 60 / 104; BAR = 4 * BEAT; E8 = BEAT / 2
M = nw("n01_hook", 19) - 0.02                      # bar 0 = "over." (the end of the hook)
bar = lambda n: round(M + n * BAR, 3)
SECT = [  # (from, chords, flag)
    (M, ["Dm", "Dm", "A7", "Dm"], ""),                       # one wrong scoop
    (SH["m1"][0], ["Dm", "Gm", "A7", "Dm"], ""),             # 1178
    (SH["w1"][0], ["Dm", "Bb", "A7", "A7"], "march"),        # the war
    (SH["w2"][0], ["F", "C"], ""),                           # the clay settles, that saves it
    (SH["c1"][0], ["Dm", "A7"], ""),                         # 1934
    (SH["d1"][0], ["Gm", "A7", "Dm", "Dm"], ""),             # 1990, closed
    (SH["l1"][0], ["Dm", "C", "Bb", "A7"], ""),              # the lead
    (SH["f1"][0], ["Dm", "Bb"], "hush"),                     # the frozen night
    (nw("n09_night", 4) - 0.1, ["Gm", "A7"], ""),            # the lurch
    (SH["y1"][0], ["F", "C", "Dm", "A7"], ""),               # the mayor, the tomatoes
    (SH["q1"][0], ["Bb", "A7"], "hush"),                     # the question
    (SH["r1"][0], ["F", "C", "Dm", "Bb"], ""),               # the reveal
    (SH["k1"][0], ["F", "C", "Bb", "C"], ""),                # the table, 38 m3, 45 cm
    (SH["p1"][0], ["D", "A", "G", "A"], ""),                 # they stop; the bookies; 200 years
]
PLAN, FLAG = [], []
n = 0
while bar(n) < D - 0.4:
    t = bar(n); k = max(i for i, s in enumerate(SECT) if s[0] <= t + 0.3)
    n0 = min(m for m in range(n + 1) if max(i for i, s in enumerate(SECT) if s[0] <= bar(m) + 0.3) == k)
    PLAN.append(SECT[k][1][(n - n0) % len(SECT[k][1])]); FLAG.append(SECT[k][2]); n += 1
TONES = {"Dm": [74, 77, 81, 86], "A7": [73, 76, 79, 81], "Gm": [74, 79, 82, 86], "Bb": [74, 77, 82, 86], "F": [72, 77, 81, 84],
         "C": [72, 76, 79, 84], "D": [74, 78, 81, 86], "G": [74, 79, 83, 86], "A": [73, 76, 81, 85]}
ROOT = {"Dm": 38, "A7": 45, "Gm": 43, "Bb": 46, "F": 41, "C": 36, "D": 38, "G": 43, "A": 45}
FIFTH = {"Dm": 45, "A7": 40, "Gm": 38, "Bb": 41, "F": 36, "C": 43, "D": 45, "G": 38, "A": 40}
chords, melody, mand, pad, drums = [], [], [], [], []
for n, c in enumerate(PLAN):
    t0, hush = bar(n), FLAG[n] == "hush"
    chords.append([t0, c])
    melody += [[t0, ROOT[c], 0.34 if hush else 0.4, False, 1.1], [round(t0 + 2 * BEAT, 3), FIFTH[c], 0.3 if hush else 0.34, False, 1.1]]
    T = TONES[c]
    if hush:   # long tremolo notes, two per bar
        mand += [[t0, T[2], 0.36, 2 * BEAT * 0.95], [round(t0 + 2 * BEAT, 3), T[1], 0.32, 2 * BEAT * 0.95]]
    else:
        pat = [T[0], T[1], T[2], T[3], T[2], T[1], T[2], T[1]] if n % 2 == 0 else [T[3], T[2], T[1], T[2], T[0], T[2], T[1], T[2]]
        for k, m in enumerate(pat):
            mand.append([round(t0 + k * E8, 3), m, 0.38 * (1.0 if k % 4 == 0 else 0.82), 0.26])
    pad.append({"t0": t0, "t1": round(min(D, t0 + BAR + 0.4), 3), "chord": c, "level": 1.0 if hush else 0.8, "attack": 0.15, "release": 0.8, "cutoff": 1700})
    if FLAG[n] == "march":
        drums += [[round(t0 + k * BEAT, 3), 0.24 if k % 2 == 0 else 0.16, "tom"] for k in range(4)]
    elif not hush:
        drums.append([t0, 0.14, "tom"])
LURCH34, LURCH95, TOUCH = nw("n05_1934", 8), nw("n09_night", 4), nw("n13_reveal", 10)
drums += [[M, 0.5, "boom"], [LURCH34, 0.5, "boom"], [LURCH95, 0.58, "boom"], [nw("n02_stakes", 7) + 0.1, 0.36, "boom"], [TOUCH, 0.34, "boom"]]
mallet = []
def ta(t, notes, vel=0.28, step=0.1):
    for k, m in enumerate(notes): mallet.append([round(t + k * step, 3), m, vel, 0.12 if k < len(notes) - 1 else 0.5])
ta(nw("n04_war", 11) + 0.05, [69, 74, 77])               # "that saves it"
ta(nw("n12_question", 0), [70, 69], 0.24, 0.3)           # the question: a falling pair
ta(nw("n13_reveal", 0), [77, 81, 84])                    # "You see,"
ta(nw("n16_numbers", 6) + 0.1, [72, 77, 81, 84])         # the top swings back
ta(nw("n18_payoff", 12), [74, 78, 81, 86], 0.3)          # "two hundred years"

# ---------------------------------------------------------------- ambience (per place)
amb = []
def A(sound, t0, t1, g, seed, fi=0.06, fo=0.06, **args):
    a = {"sound": sound, "t0": round(t0, 2), "t1": round(t1, 2), "fade_in": fi, "fade_out": fo, "gain_db": g, "seed": seed}
    if args: a["args"] = args
    amb.append(a)
DAY = [e for e in CUT if e["set"] == "piazza" and e["shot"] not in ("f1", "f2", "q1")]
runs = []
for e in CUT:   # merge consecutive pictures of the same kind of place into one bed
    kind = "night" if e["shot"] in ("f1", "f2") else "gold" if e["shot"] == "q1" else e["set"]
    if runs and runs[-1][0] == kind: runs[-1][2] = e["t1"]
    else: runs.append([kind, e["t0"], e["t1"]])
for i, (kind, a, b) in enumerate(runs):
    fi = 0.3 if a < 0.1 else 0.06
    if kind == "piazza": A("city_day", a, b, -38, 10 + i, fi, murmur=0.9, traffic=0.0); A("wind", a, b, -50, 40 + i, fi, darkness=0.6, gust=0.2, whistle=0.0)
    elif kind == "section": A("room_tone", a, b, -40, 10 + i, fi); A("wind", a, b, -50, 40 + i, fi, darkness=0.8, gust=0.3, whistle=0.0)
    elif kind == "night": A("crickets", a, b, -38, 10 + i, fi); A("wind", a, b, -46, 40 + i, fi, darkness=0.7, gust=0.3, whistle=0.1)
    elif kind == "gold": A("city_day", a, b, -44, 10 + i, fi, murmur=0.5, traffic=0.0); A("crickets", a, b, -44, 40 + i, fi)
    elif kind == "kitchen": A("room_tone", a, b, -36, 10 + i, fi); A("clock", a, b, -44, 40 + i, fi)
A("rocket_rumble", 0.0, SH["h3"][1], -42, 70, 0.2, rise=0.0)                  # the auger grinding
A("rocket_rumble", SH["r2"][0], SH["r2"][1], -44, 71, rise=0.0)
A("rocket_rumble", SH["l1"][0], SH["l1"][1], -44, 72, rise=0.1)               # the crane's engine
A("dry_leaves", 1.25, 2.6, -40, 73, density=1.2)                              # dirt running into the bucket
A("crowd_cheer", nw("n17_stop", 2), SH["p1"][1], -42, 74, excite=0.5)         # the engineers cheer
A("crowd_cheer", SH["e1"][0], D - 0.2, -46, 75, fo=0.5, excite=0.3)

# ---------------------------------------------------------------- foley
ev = []
def F(t, sound, g, pan=0.0, room=-16, **args):
    ev.append({"t": round(t, 3), "sound": sound, "gain_db": g, "pan": pan, "room": room, "args": args})
F(0.12, "metal_clang", -34, -0.2, size=0.3, pitch=1.8, dur=0.4)                # frame 0: the bucket handle
for k in range(5): F(1.3 + k * 0.25, "blanket_rustle", -34, 0.1, dur=0.3, intensity=0.6)   # dirt into the bucket
ts = nw("n02_stakes", 2)
F(ts, "wood_knock", -28, 0.3, pitch=0.6, dur=0.5); F(ts + 0.2, "poof", -30, 0.3, size=1.2, dur=0.8)   # the wrong scoop
F(ts + 0.3, "metal_groan", -32, 0.0, pitch=0.45, dur=2.0)                       # 14,000 tonnes creak
F(8.1, "distant_boom", -34, 0.0, size=0.6, dur=2.0)
for k in range(5): F(9.1 + k * 0.33, "wood_knock", -36, -0.3 + k * 0.12, pitch=1.6 + (k % 2) * 0.3, dur=0.2)   # masons' mallets
F(nw("n03_1178", 2), "metal_groan", -38, 0.0, pitch=0.5, dur=1.2)              # it starts sinking
for k in range(10): F(SH["w1"][0] + 0.1 + k * BEAT / 1.0 * 0.5, "footstep", -36, (k % 2 - 0.5) * 0.4, weight=0.8, scuff=0.4)   # the march
F(SH["w2"][0] + 0.1, "low_swell", -32, 0.0, dur=1.4, pitch=0.8)                # the clay settles
for k in range(6): F(SH["c1"][0] + 0.2 + k * 0.6, "metal_clang", -40, 0.25, size=0.25, pitch=2.2, dur=0.25)   # the pump lever
F(LURCH34, "giant_step", -26, 0.0, size=1.6); F(LURCH34 + 0.05, "poof", -30, 0.0, size=1.6, dur=1.0); F(LURCH34 + 0.1, "metal_groan", -34, 0.0, pitch=0.5, dur=1.2)
F(nw("n06_1990", 4), "wood_knock", -36, 0.3, pitch=1.2, dur=0.3)              # the 5.5 degree label lands
F(SH["d2"][0] + 0.15, "metal_clang", -32, -0.2, size=0.5, pitch=1.3, dur=0.6)  # the gate chain
for k in range(3): F(SH["l1"][0] + 0.9 * (k + 1) - 0.02, "metal_clang", -30, -0.1, size=0.9, pitch=0.8, dur=0.8)   # ingots land
for k in range(7): F(SH["f1"][0] + 0.2 + k * 0.42, "poof", -40, -0.2 + (k % 3) * 0.2, size=0.6, dur=0.9)   # nitrogen vapour
F(LURCH95, "giant_step", -24, 0.0, size=2.0); F(LURCH95 + 0.05, "metal_groan", -30, 0.0, pitch=0.4, dur=1.6); F(LURCH95 + 0.1, "poof", -32, 0.0, size=1.6, dur=1.0)
F(LURCH95 + 0.25, "crowd_noo", -36, 0.0, dur=1.2, voices=3)
F(SH["y1"][0] + 0.1, "wood_knock", -40, 0.0, pitch=1.4, dur=0.2)                # tap on the microphone
for k in range(4): F(SH["y2"][0] + 0.25 + k * 0.52, "plush_squeak", -36, -0.2, pitch=0.7, dur=0.2)   # plunger on marble
for j in range(6):                                                              # tomato splats on the cars
    F(SH["t1"][0] - 0.06 + (j % 3) * 0.37 + (j // 3) * 1.1 + 0.85, "slurp", -32, -0.3 + (j % 3) * 0.3, dur=0.25)
F(SH["q1"][0] + 0.1, "low_swell", -36, 0.0, dur=2.0, pitch=0.7)
F(TOUCH, "metal_groan", -30, 0.2, pitch=0.45, dur=1.2); F(TOUCH, "giant_step", -30, 0.2, size=1.2)
for k in range(5): F(SH["r2"][0] + 1.6 + k * 0.32, "blanket_rustle", -36, -0.2, dur=0.3, intensity=0.6)
for k in range(8): F(nw("n15_table", 6) - 0.35 + k * 0.14, "chalk_write", -38, -0.1, dur=0.12, strokes=1)   # sawing
F(nw("n15_table", 9) + 0.25, "wood_knock", -30, 0.0, pitch=0.8, dur=0.4)       # the table lands level
for k in range(4): F(SH["n1"][0] + 0.2 + k * 0.3, "wood_knock", -40, 0.3, pitch=1.0, dur=0.25)   # buckets set down
F(nw("n16_numbers", 6), "low_swell", -36, 0.0, dur=1.6, pitch=1.0)             # the top swings back
F(SH["b1"][0] + 0.3, "chalk_write", -36, 0.2, dur=0.6, strokes=3)
F(SH["e1"][0] + 0.6, "latch_click", -34, 0.3, kind="close", bright=0.8)        # a tourist's camera
ev = [e for e in ev if e["t"] < D - 0.3]

voice = [{"t": LINES[k][0], "file": f"voice/fast/{k}.wav", "gain_db": 0.0, "pan": 0.0} for k in LINES]
cues = {
    "title": "dh016 - the engineers who saved Pisa by digging under it (explainer: Tuscan clockwork, Brian narrating)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [round(D - 0.4, 2), D],
    "stem_gain_db": {"music": -6.0, "sfx": 12.0, "amb": 14.0, "voice": 0.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -15.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0}},
    "sfx_lowpass_hz": 5000,
    "shots": [[0.0, M]],
    "ambience": amb, "voice": voice, "voice_duck_db": -7.0, "events": ev,
    "music": {
        "instrument": "pluck", "gain_db": 0.0, "reverb_db": -11.0, "pad_db": -1.0, "pad_reverb_db": -6.0, "mallet_db": -3.0,
        "drums_db": -9.0, "mandolin_db": -2.0, "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
        "chords": chords, "sections": [], "melody": melody, "mallet_melody": mallet, "mandolin_melody": mand, "pad": pad,
        "drums": drums, "drum_patterns": [], "stings": [], "ducks": [],
        "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6000, "q": 0.6, "db": -4.0}],
    },
}
json.dump(cues, open(os.path.join(HERE, "cues.json"), "w"), indent=1)
print(f"cues: bar0 {M:.2f}, {len(PLAN)} bars, {len(ev)} events, {len(amb)} beds, {len(mand)} mandolin, {len(melody)} bass, {len(drums)} drums, {len(voice)} voice lines")
