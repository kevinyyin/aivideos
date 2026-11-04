# Generates cues.json for video dh012 (funny): "What if Tralalero Tralala didn't exist?"
# Run: python3 -I videos/dh012-no-tralalero/make_cues.py videos/dh012-no-tralalero/cues.json
#
# Sound identity: "BEACH TARANTELLA". The open is the beach only (surf, a holiday murmur, his sneakers squeaking on the wet
# sand, a kid yelling his name); the score ENTERS on the poof (4.6 s) with a boom: a 6/8 tarantella at dotted-quarter = 100
# (one bar = 1.2 s, bar 0 = the poof) — plucked "guitar" oom-pa-pa (bass on 1 + 4, stabs on the other eighths), a running
# mandolin hook (new `mandolin_melody`: tremolo-picked on long notes) and accordion-style reed pads (new pad `reed`), a soft
# frame-drum tom on 1 + 4. A minor for the unravelling, C major for the sneaker sale, back to A minor, a hushed half-time with
# long tremolo notes for the sunset + the aquarium, a build through the globe, and A MAJOR the moment the sneakers hop onto
# the walking shark. Booms on the big hits. Foley mirrors shots.js (TIMES is read straight out of shots.js): sneaker squeaks
# on every footfall (the strut, the sneakers walking alone, the shark's strut), a splash, a sneaker avalanche, the chant.
# Music never drops out once it starts. Different from dh005's polka, dh010's phonk and dh011's synthwave.
import json, math, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, "shots.js")).read()
blk = src[src.index("export const TIMES"):src.index("};", src.index("export const TIMES"))]
T = {k: float(v) for k, v in re.findall(r"\b([A-Z][A-Z0-9_]*): (-?\d+(?:\.\d+)?)", blk)}
D = T["END"]
M, BAR, E8 = T["POOF"], 1.2, 0.2                      # the poof = bar 0; 6/8 at dotted-quarter = 100
bar = lambda n: round(M + n * BAR, 3)
PI = math.pi

# ---------------------------------------------------------------- the chord plan (one chord per 6/8 bar)
PLAN = (["Am", "Am", "E7", "E7", "Am", "Am", "E7", "Am"]          # 0-7   the hall dominoes
        + ["Dm", "Am", "E7", "Am"]                                # 8-11  the pool
        + ["C", "C", "G7", "G7", "C"]                             # 12-16 the sneaker sale (relative major)
        + ["Am", "Am", "E7", "Am"]                                # 17-20 the fan club
        + ["Dm", "E7", "Am", "E7", "Am"]                          # 21-25 the content farm (25 = the boom)
        + ["Am", "Dm", "E7", "Am"]                                # 26-29 sunset: hushed
        + ["F", "Dm", "E7", "Am", "E7"]                           # 30-34 the aquarium
        + ["Am", "Dm", "E7", "E7", "E7"]                          # 35-39 the globe + the reef (tension)
        + ["A", "A", "D", "E7", "A", "D", "E7", "A"]              # 40-47 A MAJOR: the shoes fit; the strut
        + ["D", "A", "A"])                                        # 48-50 the card
assert len(PLAN) == 51
QUIET = set(range(26, 35))                                        # half-time feel (sunset + aquarium)
BUILD = set(range(35, 40))
chords = [[bar(n), c] for n, c in enumerate(PLAN)]

# simple voicings (pluck comp): bass root/fifth + a close triad around C4–A4
ROOT = {"A": 45, "Am": 45, "C": 48, "D": 50, "Dm": 50, "E7": 40, "F": 41, "G7": 43}
TRI = {"Am": [57, 60, 64], "A": [57, 61, 64], "C": [55, 60, 64], "D": [57, 62, 66], "Dm": [57, 62, 65], "E7": [56, 59, 62], "F": [57, 60, 65], "G7": [55, 59, 65]}
melody = []
for n, c in enumerate(PLAN):
    t0, r = bar(n), ROOT[c]
    if t0 >= D - 0.6: break
    quiet = n in QUIET
    vb = 0.34 if quiet else 0.42
    melody.append([t0, r, vb, False, 0.5 if quiet else 0.34])
    if not quiet: melody.append([round(t0 + 3 * E8, 3), r + 7, vb * 0.85, False, 0.3])
    for k in ([3] if quiet else [1, 2, 4, 5]):
        for j, m in enumerate(TRI[c]):
            melody.append([round(t0 + k * E8 + 0.006 * j, 3), m, (0.17 if quiet else 0.22) * (1.0 if k in (1, 4) else 0.85), False, 0.5 if quiet else 0.13])

# ---------------------------------------------------------------- the mandolin hook (running eighths; held notes tremolo)
PAT = {
    "Am": [[76, 81, 81, 80, 81, 83], [84, 83, 81, 80, 81, 76], [72, 76, 81, 76, 72, 76], [81, 84, 83, 81, 80, 81]],
    "E7": [[77, 76, 74, 76, 77, 80], [83, 81, 80, 77, 76, 74], [83, 80, 76, 80, 83, 86], [80, 76, 74, 71, 74, 76]],
    "Dm": [[77, 81, 86, 81, 77, 81], [86, 84, 81, 77, 76, 74]],
    "C": [[79, 84, 84, 83, 84, 86], [88, 86, 84, 83, 84, 79], [76, 79, 84, 79, 76, 79], [84, 88, 86, 84, 83, 84]],
    "G7": [[77, 79, 81, 83, 81, 79], [86, 84, 83, 81, 79, 77], [83, 79, 74, 79, 83, 86], [79, 74, 71, 74, 77, 79]],
    "F": [[77, 81, 84, 81, 77, 81], [84, 81, 77, 76, 77, 72]],
    "A": [[76, 81, 81, 80, 81, 83], [85, 83, 81, 80, 81, 76], [73, 76, 81, 76, 73, 76], [81, 85, 83, 81, 80, 81]],
    "D": [[78, 81, 86, 81, 78, 81], [86, 85, 83, 81, 78, 76]],
}
HELD = {"Am": [81, 76], "A": [81, 85], "Dm": [77, 81], "D": [78, 81], "E7": [80, 83], "F": [77, 81], "C": [79, 84], "G7": [79, 83]}
mand = []
for n, c in enumerate(PLAN):
    t0 = bar(n)
    if t0 >= D - 1.0: break
    if n in QUIET:                                                 # long tremolo notes, two per bar (dotted quarters)
        h = HELD[c]; mand += [[t0, h[0], 0.4, 0.56], [round(t0 + 0.6, 3), h[1], 0.36, 0.56]]
        continue
    if n == 7 or n == 47:                                          # phrase ends: one long tremolo note
        mand.append([t0, 81, 0.46, 1.1]); continue
    p = PAT[c][n % len(PAT[c])]
    vel = 0.44 if n >= 40 else 0.4
    for k, m in enumerate(p):
        mand.append([round(t0 + k * E8, 3), m, vel * (1.0 if k in (0, 3) else 0.84), 0.17])
for n in [48, 49]:                                                 # under the card: a slow, warm last phrase
    t0 = bar(n)
    if t0 < D - 0.8: mand.append([t0, [78, 76][n - 48], 0.36, 1.1])

# ---------------------------------------------------------------- pads: accordion reeds on the chords + an A–E drone
pad = []
for i, (t0, c) in enumerate(chords):
    t1 = chords[i + 1][0] if i + 1 < len(chords) else D - 0.3
    if t0 >= D - 0.3: break
    lvl = 1.25 if (12 <= i <= 16) else (1.05 if (int((t0 - M) / BAR + 0.01) in QUIET) else 0.75)
    pad.append({"t0": t0, "t1": min(t1, D - 0.3) + 0.35, "chord": c, "level": lvl, "attack": 0.12, "release": 0.5, "reed": True, "cutoff": 2300})
for a, b in [(M - 0.15, bar(12) + 0.3), (bar(17) - 0.3, D - 0.25)]:
    pad.append({"t0": a, "t1": b, "notes": [33, 40, 45], "level": 0.6, "attack": 0.5, "release": 0.8, "hp": 40})

# drums: a soft frame-drum tom on 1 + 4 (not in the hushed bars), booms on the big hits
drums = []
for n in range(len(PLAN)):
    t0 = bar(n)
    if t0 >= D - 1.0: break
    if n in QUIET: continue
    v = 0.26 if n not in BUILD else 0.2 + 0.03 * (n - 35)
    drums += [[t0, v, "tom"], [round(t0 + 3 * E8, 3), v * 0.75, "tom"]]
HALL_LAND = [T["H_T0"] + i * T["H_DT"] + T["H_FALL"] for i in range(5)]
DEFLATE_FLOP = T["F_DEFLATE"] + 1.05
booms = [M + 0.01, HALL_LAND[4] + 0.01, T["P_SPLASH"] + 0.01, T["S_BURST"] + 0.01, DEFLATE_FLOP, T["O_BOOM"] + 0.01, T["R_GOLD"] + 0.01, T["CARD"] + 0.01]
drums += [[t, 0.55 if i in (0, 2, 5) else 0.42, "boom"] for i, t in enumerate(booms)]
mallet = []
for t in [M + 0.02, T["H_GOLD"], T["R_GOLD"]]:                     # "ta-da" sparkles
    mallet += [[t, 81, 0.3, 0.12], [t + 0.1, 85 if t > 50 else 84, 0.3, 0.12], [t + 0.2, 88, 0.32, 0.5]]
for t in [T["O_POP1"], T["O_POP2"], T["O_POP3"]]:                   # each new "character" pops in
    mallet += [[t + 0.02, 76, 0.28, 0.1], [t + 0.12, 83, 0.3, 0.35]]
mallet += [[T["O_FAIL1"], 72, 0.26, 0.2], [T["O_FAIL1"] + 0.15, 71, 0.26, 0.2], [T["O_FAIL1"] + 0.3, 70, 0.26, 0.5]]   # wah-wah-wahh
for k, h in enumerate([T["R_HOP1"], T["R_HOP2"], T["R_HOP3"]]):    # each shoe that fits: a rising note
    mallet.append([h + 0.28, [76, 81, 85][k], 0.3, 0.3])

# ---------------------------------------------------------------- ambience
def amb_(sound, t0, t1, g, args=None, seed=1, fi=0.05, fo=0.06):
    a = {"sound": sound, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": g, "seed": seed}
    if args: a["args"] = args
    return a
SH = {s: (a, b) for a, b, s in re.findall(r"\{ t0: ([\d.]+), t1: ([\d.]+), cam: '(\w+)'", src)}
sh = lambda k: (float(SH[k][0]), float(SH[k][1]))
amb = [
    amb_("sea_waves", 0.0, sh("beachB")[1] + 0.05, -30, {"period": 6.0}, 1, fi=0.3),
    amb_("city_day", 0.0, sh("beachB")[1] + 0.05, -44, {"murmur": 0.7, "traffic": 0.0}, 2, fi=0.3),
    amb_("room_tone", sh("hallA")[0], sh("hallB")[1] + 0.05, -38, None, 3), amb_("city_day", sh("hallA")[0], sh("hallB")[1] + 0.05, -50, {"murmur": 0.4, "traffic": 0.0}, 4),
    amb_("city_day", sh("poolA")[0], sh("poolB")[1] + 0.05, -41, {"murmur": 0.9, "traffic": 0.0}, 5), amb_("wind", sh("poolA")[0], sh("poolB")[1] + 0.05, -52, {"darkness": 0.6, "gust": 0.2, "whistle": 0.0}, 6),
    amb_("room_tone", sh("shoeA")[0], sh("shoeB")[1] + 0.05, -36, None, 7), amb_("dry_leaves", sh("shoeA")[0] + 0.2, 21.7, -44, {"density": 0.5}, 8, fi=0.3, fo=0.3),
    amb_("sea_waves", sh("festA")[0], sh("festB")[1] + 0.05, -33, {"period": 5.5}, 9), amb_("crowd_cheer", sh("festA")[0], sh("festB")[1] + 0.05, -46, {"excite": 0.5}, 10),
    amb_("room_tone", sh("officeA")[0], sh("officeB")[1] + 0.05, -37, None, 11), amb_("lamp_hum", sh("officeA")[0], T["O_BOOM"], -48, None, 12, fo=0.02),
    amb_("city_day", sh("officeA")[0], sh("officeB")[1] + 0.05, -52, {"murmur": 0.4, "traffic": 0.0}, 13),
    amb_("sea_waves", sh("walkA")[0], sh("walkB")[1] + 0.05, -29, {"period": 6.5}, 14), amb_("wind", sh("walkA")[0], sh("walkB")[1] + 0.05, -50, {"darkness": 0.8, "gust": 0.2, "whistle": 0.0}, 15),
    amb_("room_tone", sh("aquaA")[0], sh("aquaB")[1] + 0.05, -33, None, 16), amb_("city_day", sh("aquaA")[0], sh("aquaB")[1] + 0.05, -50, {"murmur": 0.6, "traffic": 0.0}, 17),
    amb_("sea_waves", sh("reefA")[0], D - 0.3, -32, {"period": 7.0, "wash": 0.7}, 18, fo=0.6), amb_("wind", sh("reefA")[0], D - 0.3, -52, {"darkness": 0.7, "gust": 0.3, "whistle": 0.0}, 19, fo=0.6),
    amb_("city_day", sh("final")[0], T["CARD"], -47, {"murmur": 0.5, "traffic": 0.0}, 20, fo=0.5),
]

# ---------------------------------------------------------------- events
def ev_(t, sound, g, pan=0.0, args=None, room=-16):
    e = {"t": round(t, 3), "sound": sound, "gain_db": g, "pan": pan, "room": room}
    if args: e["args"] = args
    return e
def crossings(ph, t0, t1, target, period=2 * PI, dt=0.001):
    """times in [t0, t1] where ph(t) passes target (mod period) going up — mirrors the gait formulas in shots.js"""
    out, prev = [], None
    t = t0
    while t <= t1:
        v = math.floor((ph(t) - target) / period)
        if prev is not None and v > prev: out.append(round(t, 3))
        prev, t = v, t + dt
    return out
squeak = lambda t, g=-34, pan=0.0, p=1.4: ev_(t, "plush_squeak", g, pan, {"pitch": p, "dur": 0.12})
ev = []
# 1. the strut: his front sneakers squeak on the wet sand; the kid yells his name; the leap; POOF; the sneakers land; dominoes
LEAP = T["LEAP"]
for i, off in enumerate([0.0, PI]):
    for t in crossings(lambda t: (1.3 * t) / 0.62 * 2 * PI + off, 0.05, LEAP - 0.02, PI / 2):
        ev.append(squeak(t, -33 + (2 if t > 2.5 else 0), -0.1 + 0.2 * i, 1.35 + 0.12 * i))
# TTS: "tralalero tralala" (a beachgoer yells it at SAY1) — placed as a top-level `voice` cue below, never the formant `voice` sfx
ev += [ev_(LEAP - 0.05, "blanket_rustle", -34, 0.0, {"dur": 0.3, "softness": 0.5, "intensity": 0.6}),
       ev_(M, "poof", -13, 0.0, {"size": 2.2, "dur": 1.3}), ev_(M + 0.02, "distant_boom", -22, 0.0, {"size": 0.7, "dur": 2.0}),
       ev_(M + 0.3, "crowd_noo", -21, 0.0, {"dur": 1.9, "voices": 6})]
for i, land in enumerate([0.58, 0.66, 0.74]):
    ev.append(ev_(M + land, "giant_step", -27, -0.1 + 0.1 * i, {"size": 0.22, "surface": "ground"}))
    ev.append(squeak(M + land + 0.02, -31, -0.1 + 0.1 * i, 0.9))
for k in range(12):                                                   # the umbrella rows going down, near → far
    ev.append(ev_(M + 0.45 + k * 0.17, "wood_knock", -27 - k * 0.6, (0.4 if k % 2 else -0.4) * (1 - k / 14), {"pitch": 0.62, "dur": 0.4}))
    if k % 3 == 0: ev.append(ev_(M + 0.5 + k * 0.17, "blanket_rustle", -33, 0.0, {"dur": 0.35, "softness": 0.6, "intensity": 0.6}))
# 2. the hall: the gold statue poofs; five pedestals land like dominoes; each statue lands as an ordinary thing
ev += [ev_(T["H_GOLD"], "poof", -18, 0.0, {"size": 1.2, "dur": 0.9})]
for i, t in enumerate(HALL_LAND):
    ev.append(ev_(t, "giant_step", -21 if i == 4 else -25, (-0.3 + 0.15 * i), {"size": 0.55 if i == 4 else 0.4, "surface": "wood"}))
    if i: ev.append(ev_(t + 0.02, "poof", -26, 0.0, {"size": 0.7, "dur": 0.6}))
ev += [ev_(HALL_LAND[1] + 0.12, "metal_clang", -31, -0.1, {"size": 0.3, "pitch": 2.0, "dur": 0.5}),
       ev_(HALL_LAND[2] + 0.12, "metal_clang", -33, 0.0, {"size": 0.15, "pitch": 3.0, "dur": 0.4}),
       ev_(HALL_LAND[3] + 0.12, "wood_knock", -27, 0.1, {"pitch": 0.75}), ev_(HALL_LAND[4] + 0.12, "plush_squeak", -29, 0.2, {"pitch": 0.6}),
       ev_(11.95, "crowd_noo", -20, 0.0, {"dur": 1.4, "voices": 5})]
# 3. the pool: the bomber passes, POOF, the crocodile drops, SPLASH, swimmers land on the deck, the croc surfaces
ev += [ev_(14.0, "car_pass", -30, -0.2, {"dur": 2.4, "size": 1.4}), ev_(T["P_POOF"], "poof", -17, 0.0, {"size": 1.4, "dur": 0.9}),
       ev_(T["P_POOF"] + 0.05, "boing", -22, 0.0, {"dur": 0.6, "pitch": 0.8}), ev_(14.6, "crowd_noo", -24, 0.0, {"dur": 1.2, "voices": 4, "pitch": 1.1}),
       ev_(T["P_SPLASH"], "poof", -14, 0.0, {"size": 1.8, "dur": 1.2}), ev_(T["P_SPLASH"] + 0.03, "fish_blub", -18, 0.0, {"n_bub": 6, "dur": 0.8}),
       ev_(T["P_SPLASH"] + 0.05, "blanket_rustle", -24, 0.0, {"dur": 1.2, "softness": 0.2, "intensity": 1.0}),
       ev_(T["P_SPLASH"] + 1.05, "giant_step", -27, 0.2, {"size": 0.3, "surface": "ground"}), ev_(T["P_SPLASH"] + 1.15, "giant_step", -28, -0.2, {"size": 0.3, "surface": "ground"}),
       ev_(T["P_SPLASH"] + 0.95, "fish_blub", -22, 0.0, {"n_bub": 3, "dur": 0.5}), ev_(17.9, "fish_blub", -27, 0.0, {"n_bub": 2, "dur": 0.4})]
# 4. the sneaker store: card flips, the tumbleweed, the stockroom bulges, bursts, 1,400 sneakers, one on his head
for t in [T["S_SIGN1"], T["S_SIGN2"], T["S_SIGN3"]]: ev.append(ev_(t - 0.05, "blanket_rustle", -31, 0.1, {"dur": 0.22, "softness": 0.4, "intensity": 0.7}))
for k, t in enumerate([22.05, 22.22, 22.38, 22.48]): ev.append(ev_(t, "giant_step", -30 + k * 1.5, 0.3, {"size": 0.25 + 0.05 * k, "surface": "wood"}))
ev += [ev_(T["S_BURST"], "car_crash", -21, 0.3, {"weight": 0.35}), ev_(T["S_BURST"] + 0.05, "blanket_rustle", -22, 0.1, {"dur": 1.6, "softness": 0.3, "intensity": 1.0})]
for k in range(16): ev.append(squeak(T["S_BURST"] + 0.1 + k * 0.075, -30 - (k % 3), (k % 5 - 2) * 0.15, 0.55 + 0.05 * (k % 6)))
ev += [ev_(T["S_BURST"] + 1.45, "bonk", -23, 0.0, {"dur": 0.4}), squeak(T["S_BURST"] + 1.47, -27, 0.0, 1.2)]
# 5. the fan club: the chant (a chorus), the third legs poof down the line, they fall, the balloon deflates and flops
# TTS: "tralalero tralala" (the fan club chants it at F_SAY) — a top-level `voice` cue below
for k in range(12):
    t0 = T["F_LEGS"] + (11 - k) * 0.09
    ev.append(ev_(t0, "poof", -29, (k - 5.5) * 0.06, {"size": 0.5, "dur": 0.5}))
    if k % 2 == 0: ev.append(ev_(t0 + 0.42, "giant_step", -28, (k - 5.5) * 0.06, {"size": 0.3, "surface": "ground"}))
ev += [ev_(T["F_LEGS"] + 0.4, "crowd_noo", -21, 0.0, {"dur": 1.5, "voices": 8}),
       ev_(T["F_DEFLATE"], "metal_groan", -27, 0.0, {"dur": 1.0, "pitch": 1.7}), ev_(T["F_DEFLATE"] + 0.05, "poof", -24, 0.0, {"size": 1.0, "dur": 1.1}),
       ev_(DEFLATE_FLOP, "giant_step", -20, 0.0, {"size": 1.1, "surface": "ground"}), ev_(DEFLATE_FLOP + 0.05, "poof", -22, 0.0, {"size": 1.4, "dur": 1.0})]
# 6. the content farm: typing, three replacements pop out of the machine, fail, the fridge breaks the machine
ev.append(ev_(sh("officeA")[0] + 0.1, "keyboard_type", -33, -0.2, {"dur": T["O_BOOM"] - sh("officeA")[0] - 0.2, "rate": 16.0}))
for t in [T["O_POP1"], T["O_POP2"], T["O_POP3"]]: ev += [ev_(t, "boing", -21, 0.0, {"dur": 0.6, "pitch": 1.1}), ev_(t + 0.38, "bonk", -29, 0.0, {"dur": 0.25})]
ev += [ev_(T["O_FAIL1"] + 0.28, "bonk", -24, -0.1, {"dur": 0.35}),
       ev_(T["O_POP2"] + 0.6, "car_pass", -34, 0.3, {"dur": 0.8, "size": 0.25}), ev_(T["O_FAIL2"] + 0.25, "metal_clang", -27, 0.4, {"size": 0.4, "pitch": 1.6, "dur": 0.6}),
       ev_(T["O_POP3"] + 0.4, "giant_step", -24, 0.0, {"size": 0.5, "surface": "wood"}), ev_(T["O_TIP"], "metal_groan", -27, 0.0, {"dur": 0.5, "pitch": 1.0}),
       ev_(T["O_BOOM"], "car_crash", -20, 0.0, {"weight": 0.5}), ev_(T["O_BOOM"] + 0.02, "poof", -16, 0.0, {"size": 1.6, "dur": 1.1}),
       ev_(T["O_BOOM"] + 0.03, "distant_boom", -21, 0.0, {"size": 0.6, "dur": 1.8}), ev_(T["O_BOOM"] + 0.2, "crowd_noo", -20, 0.0, {"dur": 1.6, "voices": 9})]
# 7. sunset: the sneakers twitch, then set off along the shore (a squeak per step)
for k in range(4): ev.append(squeak(T["W_TWITCH"] + 0.05 + k * 0.17, -32, (k - 1.5) * 0.15, 1.2 + 0.1 * (k % 2)))
ev += [ev_(T["W_CRAB"] + 0.3, "plush_squeak", -36, -0.3, {"pitch": 2.0, "dur": 0.08}), ev_(T["W_CRAB"] + 1.3, "plush_squeak", -37, 0.1, {"pitch": 2.1, "dur": 0.08})]
for t in crossings(lambda t: max(0.0, t - T["W_GO"] - 0.25) * 1.15 / 0.42 * 2 * PI, T["W_GO"] + 0.26, sh("walkB")[1] - 0.05, PI):
    ev.append(squeak(t, -33, 0.0, 1.35))
# 8. the aquarium: they sink (bubbles), land in the sand, hop onto the shark, slip, tumble; the kids go "oooo"
for k in range(5): ev.append(ev_(T["A_SINK"] + 0.1 + k * 0.25, "fish_blub", -27 - k, (k - 2) * 0.15, {"n_bub": 3, "dur": 0.45}))
ev += [ev_(T["A_LAND"], "giant_step", -29, 0.0, {"size": 0.2, "surface": "ground"}), ev_(T["A_HOP"], "boing", -24, 0.0, {"dur": 0.5, "pitch": 0.75}),
       ev_(T["A_SLIP"], "bonk", -26, 0.1, {"dur": 0.3}), ev_(T["A_SLIP"] + 0.12, "bonk", -28, -0.1, {"dur": 0.3}), ev_(T["A_SLIP"] + 0.25, "bonk", -29, 0.2, {"dur": 0.3}),
       ev_(T["A_SLIP"] + 0.1, "crowd_noo", -24, 0.0, {"dur": 1.2, "voices": 4, "pitch": 1.6}), ev_(T["A_SLIP"] + 0.4, "fish_blub", -28, 0.0, {"n_bub": 4, "dur": 0.6})]
# 9. the globe: tiny steps
for k in range(10): ev.append(squeak(T["G0"] + 0.3 + k * 0.24, -38, 0.0, 1.6 + 0.1 * (k % 2)))
# 10. the reef: the trudge, the shark climbs out, three hops (boing up), gold; the strut
for t in crossings(lambda t: (t - 48.7) / 0.4 * 2 * PI, 48.72, 50.1, PI): ev.append(squeak(t, -34, -0.2, 1.1))
ev += [ev_(T["R_CLIMB"] + 0.1, "fish_blub", -26, 0.1, {"n_bub": 3, "dur": 0.5}), ev_(T["R_CLIMB"] + 0.6, "blanket_rustle", -34, 0.1, {"dur": 0.5, "softness": 0.8, "intensity": 0.4})]
for k, h in enumerate([T["R_HOP1"], T["R_HOP2"], T["R_HOP3"]]): ev += [ev_(h, "boing", -22, 0.0, {"dur": 0.5, "pitch": 0.9 + 0.15 * k}), squeak(h + 0.28, -28, 0.0, 1.2 + 0.1 * k)]
ev += [ev_(T["R_GOLD"] + 0.05, "poof", -24, 0.0, {"size": 0.8, "dur": 0.8})]
for t in crossings(lambda t: (4.4 * 2 * PI + PI + max(0.0, min(1.0, (t - (T["R_GOLD"] + 0.9)) / 1.6)) * 3.2 * PI), T["R_GOLD"] + 0.95, T["R_GOLD"] + 2.5, PI / 2, period=PI):
    ev.append(squeak(t, -31, 0.0, 1.3))
L_FIN = math.hypot(0.75, 1.4)
for t in crossings(lambda t: max(0.0, min(1.0, (t - 55.6) / 3.5)) * L_FIN / 0.3 * 2 * PI, 55.62, 59.05, PI / 2, period=PI):
    ev.append(squeak(t, -30, 0.0, 1.25 + 0.15 * (int(t * 10) % 2)))
ev += [ev_(T["Z_PHONES"], "blanket_rustle", -32, 0.0, {"dur": 0.35, "softness": 0.6, "intensity": 0.6}),
       # TTS: "tralalero… tralala?" (a reef walker, at Z_SAY) — a top-level `voice` cue below
       ev_(T["Z_POSE"], "boing", -25, 0.0, {"dur": 0.5, "pitch": 1.2})]

cues = {
    "title": "dh012 - What if Tralalero Tralala didn't exist? (funny: beach tarantella in 6/8, mandolin tremolo + accordion reeds, sneaker squeaks)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.9, D],
    "stem_gain_db": {"music": -8.0, "sfx": 12.0, "amb": 9.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -15.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0}},
    "sfx_lowpass_hz": 5000,
    "shots": sorted({float(a) for a, b in SH.values()} | {T["CARD"], D}),
    "ambience": amb,
    # ElevenLabs lines (tools/tts.py → voice/*.wav, eleven_v4): the beach yell is cut off by the poof mid-name ("tra—");
    # the fan club = two voices 30 ms apart; the reef walker asks it. Bubbles in shots.js carry the words.
    "voice": [{"t": T["SAY1"], "file": "voice/l01_beach.wav", "gain_db": -3.0, "pan": 0.15, "dur": round(M + 0.03 - T["SAY1"], 3)},
              {"t": T["F_SAY"], "file": "voice/l02_chant_a.wav", "gain_db": -4.0, "pan": -0.25},
              {"t": T["F_SAY"] + 0.03, "file": "voice/l03_chant_b.wav", "gain_db": -5.0, "pan": 0.25},
              {"t": T["Z_SAY"], "file": "voice/l04_reef.wav", "gain_db": 1.0, "pan": 0.1}],
    "voice_duck_db": -6.0,
    "events": ev,
    "music": {"instrument": "pluck", "gain_db": 0.0, "reverb_db": -11.0, "pad_db": 0.0, "pad_reverb_db": -6.0,
              "mallet_db": -2.0, "drums_db": -9.0, "mandolin_db": -1.0, "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
              "chords": chords, "sections": [], "melody": melody, "mallet_melody": mallet, "mandolin_melody": mand, "pad": pad,
              "drums": drums, "drum_patterns": [], "stings": [],
              "ducks": [], "auto_duck": {"db": -2.0, "categories": ["prop"], "lookahead": 0.04, "hold": 0.4, "smooth": 0.2, "max_len": 1.0},
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6000, "q": 0.6, "db": -4.0}]},
}
json.dump(cues, open(sys.argv[1], "w"), indent=1)
print(f"events {len(ev)}, chords {len(chords)}, mandolin {len(mand)}, comp {len(melody)}, ambience {len(amb)}, TIMES {len(T)}")
