# Generates cues.json for dh013 "Why do coins have ridges?" (narrated cartoon explainer).
# Run: python3 -I videos/dh013-coin-ridges/make_cues.py videos/dh013-coin-ridges/cues.json
#
# Sound identity: "BAROQUE CAPER" — a harpsichord-ish pluck playing an Alberti-style ostinato over a quarter-note bass at
# 108 bpm, sneaky pizzicato strings for the stake-outs and the trial, F major when Newton takes over and for the reveal,
# D major for today's coins and a rolled D chord on the last word. v2 (viral explainer re-cut): no title card, so the
# hook is the first sound and a soft pizzicato bed runs under it from frame 1.
# The narration (ElevenLabs Brian, make_voice.py) sits on top: music and ambience duck under it.
# Foley mirrors the picture: v1 cues are re-timed through each shot's src/rate (shots.js), new shots get their own.
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, "shots.js")).read()
SH = [(float(a), float(b), s, i, float(c) if c else None, float(r) if r else 1.0) for a, b, s, i, c, r in
      re.findall(r"\{ t0: ([\d.]+), t1: ([\d.]+), set: '(\w+)', id: '(\w+)'(?:, src: ([\d.]+))?(?:, rate: ([\d.]+))?", src)]
story = json.load(open(os.path.join(HERE, "story.json")))
D = story["duration"]
SH = [(a, min(b, D), s, i, c, r) for a, b, s, i, c, r in SH]
shot = {f"{s}.{i}": (a, b) for a, b, s, i, c, r in SH}
TL = json.load(open(os.path.join(HERE, "voice", "timeline.json")))
# v1's shot table: which old shot an old cue time belonged to
OLD = {"street.stall": (5.4, 7.05), "garret.clip": (7.05, 10.4), "street.pay": (10.4, 12.05), "street.chain": (12.05, 13.9),
       "tavern.button": (13.9, 16.15), "garret.mountain": (16.15, 17.6), "mint.scale": (17.6, 20.65), "mint.hall": (20.65, 23.4),
       "mint.newton": (23.4, 24.85), "mint.melt": (24.85, 26.3), "mint.press": (26.3, 27.75), "macro.mill": (27.75, 29.4),
       "macro.shave": (29.4, 31.75), "street.caught": (31.75, 33.0), "tavern.disguise": (33.0, 36.85), "garret.king": (36.85, 38.95),
       "parl.parl": (38.95, 41.25), "court.jury": (41.25, 42.4), "court.dock": (42.4, 43.75), "store.wide": (43.75, 45.5),
       "macro.clad": (45.5, 48.1), "macro.count": (48.1, 50.7), "store.trad": (50.7, 51.9)}


def nt(t):
    """an old (v1) cue time -> every video time where a re-timed shot replays that moment ([] if it was cut).
    Only shots that replay the old shot the cue belonged to; a cue up to 0.1 s before a shot's start lands on its cut."""
    own = [k for k, (o0, o1) in OLD.items() if o0 <= t < o1]
    out = []
    for a, b, s, i, c, r in SH:
        if c is None or f"{s}.{i}" not in own:
            continue
        T = a + (t - c) / r
        if a - 0.1 <= T < b - 0.05:
            out.append(round(max(T, a), 3))
    return out


M0, BEAT = 0.12, 60 / 108
BAR = 4 * BEAT
bar = lambda n: round(M0 + n * BAR, 3)
PLAN = ["Dm", "Dm", "Gm", "A7",                                    # 0-3   the hook (tavern), Parliament laughs
        "Dm", "Dm", "Gm", "A7", "Dm", "A7",                        # 4-9   clipping, the chain, the button, half
        "F", "A7",                                                 # 10-11 Newton takes over, the question
        "Dm", "Gm", "Dm", "A7", "Dm", "Gm", "A7",                  # 12-18 the chase, the bribe, two years, the verdict
        "F", "C", "Dm", "Bb", "F", "C",                            # 19-24 the reveal: ridges, the jar
        "D", "G", "Bm", "A"]                                       # 25-28 today's quarter
END_CHORD = 64.2                                                   # "stealing": a rolled D, held to the end
chords = [[bar(n), c] for n, c in enumerate(PLAN) if bar(n) < END_CHORD] + [[END_CHORD, "D"]]
sections = [
    {"t0": M0, "t1": bar(4), "style": "strings", "step": BEAT / 2, "pattern": [0, 2, 1, 2, 3, 2, 1, 2], "accent": [1.0, 0.6, 0.8, 0.6], "len": 0.9, "octave": 1,
     "vel": [[M0, 0.24], [bar(2), 0.28], [bar(4), 0.3]]},
    {"t0": bar(4), "t1": bar(10), "style": "ostinato", "inst": "pluck", "step": BEAT / 2, "pattern": [0, 2, 1, 2, 0, 2, 1, 2], "bass_every": 2, "bass_vel": 0.75, "len": 0.8,
     "vel": [[bar(4), 0.22], [bar(7), 0.25], [bar(10), 0.26]]},
    {"t0": bar(10), "t1": bar(12), "style": "ostinato", "inst": "pluck", "step": BEAT / 2, "pattern": [0, 1, 2, 4, 2, 1, 0, 1], "bass_every": 2, "bass_vel": 0.8, "len": 0.85,
     "vel": [[bar(10), 0.26], [bar(11), 0.28], [bar(12), 0.26]]},
    {"t0": bar(12), "t1": bar(19), "style": "strings", "step": BEAT / 2, "pattern": [0, 2, 1, 2, 3, 2, 1, 2], "accent": [1.0, 0.6, 0.8, 0.6], "len": 0.9, "octave": 1,
     "vel": [[bar(12), 0.3], [bar(18), 0.36]]},
    {"t0": bar(19), "t1": bar(25), "style": "ostinato", "inst": "pluck", "step": BEAT / 2, "pattern": [0, 1, 2, 4, 2, 1, 0, 1], "bass_every": 2, "bass_vel": 0.8, "len": 0.85,
     "vel": [[bar(19), 0.25], [bar(22), 0.29], [bar(25), 0.26]]},
    {"t0": bar(25), "t1": END_CHORD, "style": "ostinato", "inst": "pluck", "step": BEAT / 2, "pattern": [0, 1, 2, 1, 4, 2, 1, 2], "bass_every": 2, "bass_vel": 0.7, "len": 0.9,
     "vel": [[bar(25), 0.22], [END_CHORD, 0.25]]},
    {"t0": END_CHORD, "t1": D, "style": "cadence", "vel": [[END_CHORD, 0.32], [D, 0.28]], "roll": 0.09},
]
# a soft string pad under the strings sections, a quiet bed elsewhere (keeps the music bus continuous)
CH = chords + [[D, None]]
pad = [{"t0": a, "t1": b + 0.4, "chord": c, "level": 0.62 if (a < bar(4) or bar(12) <= a < bar(19)) else 0.45, "attack": 0.3, "release": 0.6, "cutoff": 1400}
       for (a, c), (b, _) in zip(CH, CH[1:])]
# mallet accents: Newton takes over (rising F), the ridges (rising F, higher), today (rising D)
N_REVEAL, RIDGES, TODAY = 24.37, 46.93, shot["store.wide"][0]
mallet = [[N_REVEAL + k * 0.09, m, 0.3, 0.3] for k, m in enumerate([65, 69, 72, 77])]
mallet += [[RIDGES + k * 0.08, m, 0.26, 0.3] for k, m in enumerate([72, 77, 81, 84])]
mallet += [[TODAY + 0.05 + k * 0.1, m, 0.24, 0.35] for k, m in enumerate([62, 66, 69, 74])]
drums = [[N_REVEAL, 0.5, "taiko"], [41.1, 0.55, "boom"], [END_CHORD, 0.35, "boom"]]

def amb_(sound, t0, t1, g, args=None, seed=1, fi=0.05, fo=0.06):
    a = {"sound": sound, "t0": round(t0, 3), "t1": round(t1, 3), "fade_in": fi, "fade_out": fo, "gain_db": g, "seed": seed}
    if args: a["args"] = args
    return a
amb, seed = [], 1
PLACE = {
    "street": [("city_day", -40, {"murmur": 0.8, "traffic": 0.0})],
    "garret": [("room_tone", -38, None), ("wind", -52, {"darkness": 0.7, "gust": 0.3, "whistle": 0.08})],
    "tavern": [("city_day", -41, {"murmur": 1.0, "traffic": 0.0}), ("room_tone", -40, None), ("dry_leaves", -54, {"density": 0.25})],
    "mint": [("room_tone", -36, None), ("city_day", -52, {"murmur": 0.3, "traffic": 0.0})],
    "macro": [("room_tone", -42, None)],
    "parl": [("city_day", -40, {"murmur": 1.0, "traffic": 0.0}), ("room_tone", -42, None)],
    "court": [("room_tone", -38, None), ("city_day", -50, {"murmur": 0.6, "traffic": 0.0})],
    "store": [("room_tone", -40, None)],
}
for a, b, s, i, c, r in SH:
    b = min(b, D)
    for snd, g, args in PLACE[s]:
        amb.append(amb_(snd, a, b + 0.05, g, args, seed)); seed += 1
# the store's lamp hum in every store shot; the furnace roars in the melt shot; the House jeers at "mocked"
for a, b, st, i, c, r in SH:
    if st == "store":
        amb.append(amb_("lamp_hum", a, b + 0.05, -46, None, 90 + len(amb), fi=0.08))
amb += [amb_("wind", shot["mint.melt"][0], shot["mint.melt"][1] + 0.05, -44, {"darkness": 1.0, "gust": 0.6, "whistle": 0.0}, 93),
        amb_("crowd_cheer", 7.85, shot["parl.laugh"][1] + 0.05, -36, {"excite": 0.6}, 94, fi=0.12, fo=0.08)]

def ev_(t, sound, g, pan=0.0, args=None, room=-16):
    e = {"t": round(t, 3), "sound": sound, "gain_db": g, "pan": pan, "room": room}
    if args: e["args"] = args
    return e
clink = lambda t, g=-30, p=3.0, pan=0.0: ev_(t, "metal_clang", g, pan, {"size": 0.1, "pitch": p, "dur": 0.35})
snip = lambda t, pan=0.0: ev_(t, "latch_click", -27, pan, {"kind": "close", "bright": 1.6, "strength": 0.8})
shrink = lambda t: ev_(t, "boing", -31, 0.0, {"dur": 0.3, "pitch": 1.7})
OLD_EV = [
    shrink(5.5), clink(6.62, -31, 3.2), shrink(6.75),                                     # the coin shrinks as it is spent
    snip(9.05), clink(9.52, -33, 3.6, 0.2),                                               # the clipper's snip, the sliver tinks into the jar
    clink(10.95, -30), ev_(11.38, "wood_knock", -30, 0.1, {"pitch": 1.7, "dur": 0.2}),   # paid; the baker bites it
    snip(12.54, -0.2), shrink(12.56), clink(13.17, -30, 3.0, 0.2), snip(13.46, 0.2), shrink(13.48),
    ev_(16.2, "poof", -24, 0.0, {"size": 1.4, "dur": 0.9}), ev_(16.25, "keyboard_type", -32, 0.0, {"dur": 1.3, "rate": 24}),
    ev_(16.3, "distant_boom", -30, 0.0, {"size": 0.5, "dur": 1.6}),
    ev_(19.45, "wood_knock", -24, -0.1, {"pitch": 0.75, "dur": 0.5}), ev_(19.47, "boing", -31, -0.1, {"dur": 0.5, "pitch": 0.9}),
    ev_(20.9, "door_open", -26, 0.0, {"creak": 1.2, "pitch": 0.75}),
    ev_(23.92, "wood_knock", -29, 0.15, {"pitch": 1.3, "dur": 0.25}),                     # the apple lands in his palm
    ev_(25.35, "blanket_rustle", -36, 0.2, {"dur": 0.6, "intensity": 1.0, "softness": 0.2}),
    ev_(26.47, "giant_step", -21, 0.0, {"size": 0.6}), ev_(26.48, "metal_clang", -23, 0.0, {"size": 0.9, "pitch": 0.7}),
    ev_(27.27, "giant_step", -21, 0.0, {"size": 0.6}), ev_(27.28, "metal_clang", -23, 0.0, {"size": 0.9, "pitch": 0.75}),
    clink(27.4, -31, 3.0), clink(27.8, -32, 3.3),
    ev_(29.6, "chalk_write", -25, 0.0, {"dur": 1.3, "strokes": 9}),                     # the file's rasp
    ev_(31.28, "metal_clang", -30, 0.0, {"size": 0.15, "pitch": 2.5, "dur": 0.6}),        # the ridges vanish
    ev_(32.05, "crowd_noo", -38, 0.0, {"dur": 0.6, "voices": 2, "pitch": 1.4}),
    ev_(34.1, "blanket_rustle", -32, -0.15, {"dur": 0.4, "intensity": 0.6, "softness": 0.6}),
    ev_(35.75, "blanket_rustle", -32, -0.15, {"dur": 0.4, "intensity": 0.6, "softness": 0.6}),
    ev_(40.2, "crowd_noo", -31, 0.0, {"dur": 1.0, "voices": 7, "pitch": 1.25}),          # the House gasps
    ev_(41.65, "blanket_rustle", -34, 0.2, {"dur": 0.3, "intensity": 0.5}),
    ev_(42.02, "boing", -30, 0.15, {"dur": 0.45, "pitch": 0.75}), ev_(42.15, "crowd_noo", -34, 0.1, {"dur": 0.8, "voices": 5, "pitch": 1.2}),
    ev_(42.62, "plush_pickup", -30, 0.15), ev_(42.9, "metal_clang", -26, 0.2, {"size": 0.6, "pitch": 1.0}),
    clink(44.15, -31, 3.0, 0.1), clink(44.27, -32, 3.4, 0.1), clink(44.39, -31, 2.7, 0.1),  # change into the dish
    ev_(52.22, "lamp_switch_click", -24, 0.0), ev_(52.5, "keyboard_type", -36, -0.1, {"dur": 1.0, "rate": 14}),
    clink(53.55, -32, 3.3, -0.1), ev_(54.45, "phone_set_down_wood", -32, 0.0), clink(54.47, -33, 3.1),
    ev_(54.86, "lamp_switch_click", -24, 0.0),
]
OLD_EV += [ev_(21.4 + k * 0.33, "footstep", -34, 0.0, {"weight": 0.8, "scuff": 0.6}) for k in range(6)]
OLD_EV += [clink(25.6 + k * 0.07, -34, 2.6 + 0.2 * (k % 3), 0.2) for k in range(9)]

# drop v1 cues whose picture is gone or changed: the House gasp (now a laugh), the dish + power cut (store v1 ending)
OLD_EV = [e for e in OLD_EV if not (40.1 < e["t"] < 40.4 or e["t"] >= 51.9)]
ev = []
for e in OLD_EV:
    for T in nt(e["t"]):
        ev.append({**e, "t": T})
# v2 shots
ev += [
    ev_(0.1, "blanket_rustle", -32, -0.1, {"dur": 0.45, "intensity": 0.7, "softness": 0.4}),        # the Gazette goes up
    clink(3.05, -33, 2.8, -0.1), clink(3.2, -34, 3.1, -0.1),                                           # the coiners' bag of fakes
    ev_(24.8, "chalk_write", -25, 0.0, {"dur": 1.3, "strokes": 9}),                                   # the file on the smooth coin
    clink(32.45, -31, 3.0, 0.1), clink(32.6, -32, 3.4, 0.1), clink(32.75, -31, 2.8, 0.15),            # the purse changes hands
    ev_(35.1, "blanket_rustle", -34, 0.15, {"dur": 0.4, "intensity": 0.6, "softness": 0.6}),         # informants lean in
    ev_(37.05, "blanket_rustle", -34, 0.15, {"dur": 0.4, "intensity": 0.6, "softness": 0.6}),
    ev_(51.6, "latch_click", -30, 0.0, {"kind": "open", "bright": 1.2, "strength": 0.6}),             # the jar lid
    ev_(53.75, "blanket_rustle", -27, 0.0, {"dur": 0.22, "intensity": 1.0, "softness": 0.0}),        # the foil tears
    clink(53.95, -33, 3.6, 0.05),                                                                      # the spoon hits the jar
    snip(63.1, -0.1), clink(63.13, -31, 3.0, -0.1),                                                   # the clipper snips a quarter
    ev_(63.95, "boing", -32, 0.0, {"dur": 0.45, "pitch": 0.6}),                                       # nothing worth stealing
]
# the witness runs (1.7 m/s, a step every 0.3 m), Chaloner strolls off (0.45 m/s, a step every 0.21 m)
ev += [ev_(33.0 + k * 0.18, "footstep", -35, -0.2, {"weight": 0.6, "scuff": 0.3}) for k in range(5)]
ev += [ev_(33.85 + 0.47 * k, "footstep", -34, 0.0, {"weight": 0.8, "scuff": 0.6}) for k in range(3)]
ev.sort(key=lambda e: e["t"])

cues = {
    "title": "dh013 v2 - Why do coins have ridges? (explainer: baroque caper — pluck ostinato + walking bass, pizzicato strings, narration on top)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.4, D],
    "stem_gain_db": {"music": -9.0, "sfx": 10.0, "amb": 8.0, "voice": 0.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -15.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0}},
    "sfx_lowpass_hz": 5000,
    "shots": sorted({a for a, b, s, i, c, r in SH} | {D}),
    "ambience": amb,
    "voice": [{"t": l["t"], "file": l["file"], "gain_db": -3.0, "pan": 0.0} for l in TL["lines"]],
    "voice_duck_db": -9.0,
    "events": ev,
    "music": {"instrument": "pluck", "gain_db": 0.0, "reverb_db": -12.0, "pad_db": 3.0, "pad_reverb_db": -6.0,
              "mallet_db": -3.0, "strings_db": 4.0, "drums_db": -10.0, "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
              "chords": chords, "sections": sections, "melody": [], "mallet_melody": mallet, "pad": pad,
              "drums": drums, "drum_patterns": [], "stings": [],
              "ducks": [], "auto_duck": {"db": -1.0, "categories": ["prop"], "lookahead": 0.04, "hold": 0.4, "smooth": 0.2, "max_len": 1.0},
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6000, "q": 0.6, "db": -4.0}]},
}
json.dump(cues, open(sys.argv[1], "w"), indent=1)
print(f"{len(SH)} shots, {len(chords)} chords, {len(ev)} events, {len(amb)} ambience beds, {len(TL['lines'])} voice lines")
