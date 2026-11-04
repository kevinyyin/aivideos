# Generates cues.json for video dh005 (funny): "What if Tung Tung Tung Sahur didn't exist?"
# Run: python3 -I videos/dh005-no-tung-tung/make_cues.py videos/dh005-no-tung-tung/cues.json
#
# Sound identity: "BRAINROT POLKA → SAHUR PATROL". The open is the hall only (a murmur, phones, six fast gong bongs); the score
# ENTERS on the poof (4.4 s) — a BLAST now (v2): a boom, a
# huge poof, a far explosion, then a crowd groaning "noooo" (new `crowd_noo` SFX). Bouncy F-major piano oom-pah at 120 bpm
# (F Dm Gm7 C7), a staccato mallet hook opening every place ("tung-tung-tung · SA-hur"), soft kick + clap under the ladder.
#   - +1 second / +1 minute (the AI bubble, the GPU hall): the groove panics into D minor (Dm Bb Gm A7) with the hook in A;
#     the bubble's POP, the stock arrow's impact (boom + crash + far explosion), 26 racks clanging down like dominoes.
#   - +1 month (subway): held chords while everyone reads; a phone buzz + a boom bring the groove back.
#   - +1 year (the kampung at 3 AM): a warm, slower F arp under the patrol's REAL rhythm — kentongan knocks (tung tung tung · rest)
#     on the beat grid, the bedug on beat 1 (soft taiko), the kid's water jug on the off-beats — and the hook slowed on piano.
# v2 retimed the video: SH mirrors shots.js SHOTS (src = the v1 time each shot starts at); v1 cues are written in v1 time and
# remapped (cues inside skipped stretches are dropped). Music never drops out.
import json, sys

D = 67.2
M, BEAT, BAR = 4.4, 0.5, 2.0                   # mirrors shots.js (the poof = beat 0)
SH = [(0, 5.3, 0), (5.3, 7.4, 6.4), (7.4, 10.0, None), (10.0, 12.4, None), (12.4, 17.0, None), (17.0, 19.2, 14.6), (19.2, 22.0, 17.0),
      (22.0, 24.4, 9.0), (24.4, 26.6, 11.6), (26.6, 29.0, 20.2), (29.0, 31.4, 22.6), (31.4, 34.0, 25.6), (34.0, 36.4, 28.2),
      (36.4, 37.9, 31.2), (37.9, 39.6, 32.7), (39.6, 41.6, 34.4), (41.6, 44.1, 37.3), (44.1, 46.6, 39.8), (46.6, 50.0, 43.6),
      (50.0, 53.6, 47.0), (53.6, 56.6, 50.6),
      (56.6, 57.5, None), (57.5, 58.2, None), (58.2, 58.8, None), (58.8, 59.4, None), (59.4, 67.2, None)]   # v3: rewind + the giant
SCENES = [s[0] for s in SH] + [62.8]
def nt(t):
    """v1 time → video time (None if that moment was cut)"""
    for t0, t1, src in SH:
        if src is not None and src - 1e-6 <= t < src + (t1 - t0) - 1e-6: return round(t0 + (t - src), 3)
    return None
BUB_POP, ARROW_HIT, DC0, RACK_DT = 8.35, 9.35, 13.0, 0.17      # mirrors shots.js
LAST_RACK = DC0 + 0.35 + 12 * RACK_DT + 0.42
CALM0, BUZZ, NIGHT, FADE = 41.4, 44.4, 46.4, 56.4
REW, GIANT, CARD = 56.4, 59.4, 62.4                 # v3: rewind, the giant comeback, the end card (on the beat grid)
GROW, BONKS = 59.7, [60.65, 61.4]
beat_t = lambda n: M + n * BEAT
on_beat = lambda t: beat_t(-(-round((t - M) / BEAT * 1000) // 1000))   # first beat at/after t
# the patrol's hits: computed in v1 time exactly as shots.js does, then shifted with the kampung shots (+3.0 s = 6 beats)
KT, BT, GT = [], [], []
n = 0
while True:
    t = beat_t(n); n += 1
    if t > 53.5: break                             # the patrol cuts away at 56.6 (v1 53.6)
    if t < 42.7: continue
    b = (n - 1) % 4
    if b < 3: KT.append(t + 3.0)
    if b == 0: BT.append(t + 3.0)
    GT.append(t + 3.25)

# ---------------------------------------------------------------- music
chords = [[0.2, "F"]]
def run(t0, t1, prog, bar=BAR):
    t, k = t0, 0
    while t < t1 - 0.01:
        chords.append([round(t, 3), prog[k % len(prog)]]); t += bar; k += 1
P0, P1 = 7.4, 16.9                                  # the panic (on the beat grid)
run(M, P0, ["F", "C7"], 1.5)
run(P0, P1, ["Dm", "Bb", "Gm", "A7"])
run(P1, CALM0, ["F", "Dm", "Gm7", "C7"])
run(CALM0, BUZZ, ["Bbmaj7", "F/A"], 1.5)
run(BUZZ, NIGHT, ["F", "C7"], 1.0)
run(NIGHT, REW, ["F", "C/E", "Dm7", "Bbmaj7"])
run(REW, CARD, ["Dm", "Bb", "Gm", "A7"], 1.5)
run(CARD, D, ["F", "Bb/F"], 2.4)

sections = [
    {"t0": M, "t1": CALM0, "style": "bounce", "vel": [[M, 0.25], [P0, 0.29], [P1, 0.28], [31.4, 0.29], [CALM0, 0.29]], "step": BEAT, "bass_hold": 1.8, "stab_hold": 1.0},
    {"t0": CALM0, "t1": BUZZ, "style": "held", "vel": [[CALM0, 0.24], [BUZZ, 0.22]]},
    {"t0": BUZZ, "t1": NIGHT, "style": "bounce", "vel": [[BUZZ, 0.3], [NIGHT, 0.28]], "step": BEAT, "bass_hold": 1.8, "stab_hold": 1.0},
    {"t0": NIGHT, "t1": REW, "style": "arp", "vel": [[NIGHT, 0.26], [REW, 0.3]], "step": 0.25, "pattern": [0, 1, 2, 3, 2, 1]},
    {"t0": REW, "t1": CARD, "style": "bounce", "vel": [[REW, 0.28], [GIANT, 0.31], [CARD, 0.3]], "step": BEAT, "bass_hold": 1.8, "stab_hold": 1.0},
    {"t0": CARD, "t1": D, "style": "held", "vel": [[CARD, 0.26], [D, 0.22]]},
]
mallet = []
for s0 in [17.0, 22.0, 26.6, 31.4, 36.4, BUZZ]:        # the hook in F
    t = on_beat(s0 + 0.02)
    mallet += [[t, 72, 0.3, 0.12], [t + 0.25, 72, 0.28, 0.12], [t + 0.5, 72, 0.3, 0.12], [t + 0.75, 77, 0.32, 0.4]]
for s0 in [7.4, 12.4]:                              # the hook in D minor (panic)
    t = on_beat(s0 + 0.02)
    mallet += [[t, 69, 0.3, 0.12], [t + 0.25, 69, 0.28, 0.12], [t + 0.5, 69, 0.3, 0.12], [t + 0.75, 74, 0.32, 0.4]]
mallet += [[M + 0.02, 77, 0.3, 0.12], [M + 0.27, 81, 0.3, 0.12], [M + 0.52, 84, 0.32, 0.5]]              # the poof's "ta-da"
mallet += [[34.4, 69, 0.26, 0.2], [34.55, 67, 0.25, 0.2], [34.7, 65, 0.26, 0.45]]                         # 0 · 0 · 0
t = on_beat(GIANT + 0.4); mallet += [[t, 69, 0.32, 0.12], [t + 0.25, 69, 0.3, 0.12], [t + 0.5, 69, 0.32, 0.12], [t + 0.75, 74, 0.34, 0.4]]   # he's back
h = on_beat(50.45)
melody = [[h, 72, 0.24, False, 0.45], [h + 0.5, 72, 0.23, False, 0.45], [h + 1.0, 72, 0.24, False, 0.45], [h + 1.5, 77, 0.26, False, 1.4],
          [54.4, 76, 0.22, False, 0.9], [55.4, 74, 0.22, False, 0.9],
          [CARD + 0.1, 72, 0.22, False, 1.0], [CARD + 1.3, 69, 0.21, False, 1.0], [CARD + 2.5, 65, 0.22, False, 2.0]]
pad = [{"t0": M - 0.3, "t1": D - 0.2, "notes": [41, 48, 53], "level": 0.85, "attack": 0.4, "release": 0.8}]
for i in range(1, len(chords)):
    c0 = chords[i][0]; c1 = chords[i + 1][0] if i + 1 < len(chords) else D - 0.3
    pad.append({"t0": c0, "t1": c1 + 0.35, "chord": chords[i][1], "level": 0.55 if c0 < NIGHT else 1.5, "attack": 0.15, "release": 0.6})
drums = [[M + 0.02, 0.62, "boom"], [BUB_POP + 0.02, 0.4, "boom"], [ARROW_HIT + 0.02, 0.62, "boom"], [LAST_RACK + 0.02, 0.5, "boom"],
         [33.52, 0.42, "boom"], [36.17, 0.45, "boom"], [BUZZ + 0.02, 0.45, "boom"], [40.92, 0.3, "boom"],
         [GROW + 0.02, 0.62, "boom"], [BONKS[0] + 0.02, 0.4, "boom"], [BONKS[1] + 0.02, 0.45, "boom"], [CARD + 0.02, 0.3, "boom"]]
drums += [[t, 0.42, "taiko"] for t in BT if t < REW + 0.15]                                                # the bedug
drum_patterns = [
    {"t0": on_beat(P0), "t1": CALM0 - 0.05, "step": 2 * BEAT, "pattern": [1], "vel": [[P0, 0.4], [P1, 0.34], [CALM0, 0.36]], "kind": "kick"},
    {"t0": on_beat(P0) + BEAT, "t1": CALM0 - 0.05, "step": 2 * BEAT, "pattern": [1], "vel": 0.33, "kind": "clap"},
    {"t0": on_beat(BUZZ), "t1": NIGHT - 0.05, "step": 2 * BEAT, "pattern": [1], "vel": 0.36, "kind": "kick"},
    {"t0": REW, "t1": CARD - 0.05, "step": 2 * BEAT, "pattern": [1], "vel": 0.4, "kind": "kick"},
    {"t0": REW + BEAT, "t1": CARD - 0.05, "step": 2 * BEAT, "pattern": [1], "vel": 0.34, "kind": "clap"},
]
stings = [{"t": 7.15, "midi": 36, "vel": 0.3, "hold": 1.0}, {"t": 16.6, "midi": 38, "vel": 0.28, "hold": 1.0},
          {"t": 21.5, "midi": 36, "vel": 0.3, "hold": 1.0}, {"t": 28.35, "midi": 34, "vel": 0.3, "hold": 1.0}]


# ---------------------------------------------------------------- ambience (video time)
def amb_(sound, t0, t1, g, args=None, seed=1, fi=0.05, fo=0.06):
    a = {"sound": sound, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": g, "seed": seed}
    if args: a["args"] = args
    return a

amb = [
    amb_("room_tone", 0.0, 7.45, -38, fi=0.3), amb_("city_day", 0.0, 7.45, -50, {"murmur": 0.45, "traffic": 0.0}, 1, fi=0.3),
    amb_("city_day", 7.4, 12.45, -42, {"murmur": 0.8, "traffic": 0.6}, 2), amb_("traffic_flow", 7.4, 12.45, -50, None, 3),
    amb_("room_tone", 12.4, 17.05, -36), amb_("cabin_hum", 12.4, 17.05, -46, None, 4),
    amb_("city_day", 17.0, 22.05, -45, {"murmur": 0.85, "traffic": 0.0}, 5), amb_("wind", 17.0, 22.05, -54, {"darkness": 0.5, "gust": 0.1, "whistle": 0.0}, 6),
    amb_("room_tone", 22.0, 26.65, -39), amb_("city_day", 22.0, 26.65, -49, {"murmur": 0.5, "traffic": 0.0}, 7),
    amb_("city_day", 26.6, 27.2, -42, {"murmur": 0.9, "traffic": 0.2}, 8, fo=0.25), amb_("city_day", 27.15, 29.3, -56, {"murmur": 0.0, "traffic": 0.25}, 9),
    amb_("city_day", 29.25, 31.45, -41, {"murmur": 1.0, "traffic": 0.2}, 10, fi=0.12), amb_("crowd_cheer", 29.3, 31.45, -46, {"excite": 0.6}, 11, fi=0.2),
    amb_("room_tone", 31.4, 36.45, -38), amb_("city_day", 31.4, 36.45, -52, {"murmur": 0.35, "traffic": 0.0}, 12),
    amb_("room_tone", 36.4, 41.65, -38), amb_("city_day", 36.4, 41.65, -51, {"murmur": 0.4, "traffic": 0.1}, 13),
    amb_("applause", 41.1, 41.65, -40, {"density": 30.0, "swell": 0.4}, 14, fi=0.1),
    amb_("cabin_hum", 41.6, 46.65, -41), amb_("traffic_flow", 41.6, 46.65, -52, None, 15),
    amb_("wind", 46.6, 56.65, -49, {"darkness": 0.85, "gust": 0.15, "whistle": 0.0}, 16, fo=0.1), amb_("room_tone", 46.6, 56.65, -44, None, 17, fo=0.1),
    amb_("room_tone", 59.4, 62.6, -38, None, 18, fo=0.4), amb_("city_day", 59.4, 62.6, -48, {"murmur": 0.6, "traffic": 0.0}, 19, fo=0.4),
]


# ---------------------------------------------------------------- events
def ev_(t, sound, g, pan=0.0, args=None, room=-16):
    e = {"t": round(t, 3), "sound": sound, "gain_db": g, "pan": pan, "room": room}
    if args: e["args"] = args
    return e

def steps(t0, t1, g, rate, p0=0.0, p1=0.0):
    return {"sound": "footsteps", "t0": t0, "t1": t1, "pan0": p0, "pan1": p1, "gain_db": g, "rate": rate}

# v1 cues, in v1 time (remapped below)
old = []
# 1. the hall: three gong bongs for the phones, the "sahur" pose, POOF, the bat clatters down, a shrug
for t in [0.5, 0.9, 1.3, 1.7, 2.1, 2.5]: old.append(ev_(t, "metal_clang", -27, 0.25, {"size": 0.9, "pitch": 1.25, "dur": 1.0}))
old += [ev_(3.3, "plush_squeak", -29, 0.0, {"pitch": 0.75}), 
       ev_(5.05, "wood_knock", -24, -0.05, {"pitch": 1.5}), ev_(5.32, "wood_knock", -31, -0.05, {"pitch": 1.6, "dur": 0.3}),
       ev_(5.0, "blanket_rustle", -34, 0.0, {"dur": 0.4, "softness": 0.5, "intensity": 0.6}),
       steps(6.35, 6.85, -32, 4.0, -0.2, 0.2), ev_(7.0, "plush_squeak", -31, 0.0, {"pitch": 0.8}),
       ev_(7.95, "plush_squeak", -29, 0.0, {"pitch": 0.6})]
# 2. the toy aisle: a ripple of small poofs down the shelves at us, the cart's, the kid's; price tags flutter
for k in range(10): old.append(ev_(9.3 + k * 0.16, "poof", -33 + k * 0.8, (-0.5 if k % 2 else 0.5) * (1 - k / 12), {"size": 0.5, "dur": 0.5}))
old += [ev_(10.95, "poof", -24, 0.3, {"size": 0.8, "dur": 0.7}), ev_(11.15, "poof", -22, -0.1, {"size": 0.7, "dur": 0.7}),
       ev_(11.5, "plush_squeak", -30, -0.1, {"pitch": 0.62}), ev_(11.6, "blanket_rustle", -36, -0.3, {"dur": 0.9, "softness": 0.7, "intensity": 0.4}),
       ev_(12.6, "blanket_rustle", -36, 0.3, {"dur": 0.9, "softness": 0.7, "intensity": 0.4}), ev_(13.35, "plush_squeak", -29, -0.1, {"pitch": 0.95})]
# 3. the server: a jump in sync (one big landing), then 234 avatars pop out back to front, one left
old += [ev_(15.3, "blanket_rustle", -32, 0.0, {"dur": 0.3, "softness": 0.4, "intensity": 0.7}), ev_(15.82, "giant_step", -24, 0.0, {"size": 0.35, "surface": "ground"})]
for k in range(16): old.append(ev_(17.2 + k * 0.115, "plush_squeak", -33 + (k % 3), (k % 5 - 2) * 0.2, {"pitch": 1.1 + 0.06 * (k % 6)}))
old += [ev_(19.1, "plush_squeak", -30, 0.1, {"pitch": 0.55})]
# 4. recess: they run in, stop dead, inhale… nothing (the chatter is gone), "tag" → everyone runs
old += [steps(19.85, 20.75, -30, 11.0, -0.3, 0.3), ev_(21.0, "low_swell", -30, 0.0, {"dur": 0.6, "pitch": 1.1}),
       ev_(22.85, "plush_squeak", -29, -0.1, {"pitch": 0.9}), steps(22.95, 25.35, -30, 13.0, -0.4, 0.4)]
# 5. auditions: tink, plink, CLANG — the gong comes off, rolls across (a long low roll), 0 · 0 · 0, the ropes go down
old += [ev_(25.95, "metal_clang", -30, 0.3, {"size": 0.35, "pitch": 2.4, "dur": 0.6}), ev_(26.75, "metal_clang", -30, 0.3, {"size": 0.25, "pitch": 3.0, "dur": 0.5}),
       ev_(27.7, "metal_clang", -20, 0.3, {"size": 1.3, "pitch": 1.1, "dur": 1.4}), ev_(28.05, "metal_clang", -24, 0.2, {"size": 1.1, "pitch": 0.8, "dur": 1.0}),
       ev_(28.1, "metal_groan", -29, 0.2, {"dur": 2.2, "pitch": 1.2}), ev_(28.6, "blanket_rustle", -32, 0.0, {"dur": 0.3, "softness": 0.3, "intensity": 0.7}),
       ev_(30.35, "car_crash", -27, -0.4, {"weight": 0.25}), ev_(30.42, "metal_clang", -26, -0.4, {"size": 0.8, "pitch": 1.0, "dur": 1.0}),
       ev_(30.5, "bonk", -31, -0.45, {"dur": 0.3}), ev_(30.62, "bonk", -32, -0.5, {"dur": 0.3}), ev_(30.75, "bonk", -33, -0.55, {"dur": 0.3})]
# 6. the classroom: a chalk tap, 8 cards go up (one rustle + a boop), the binder: lift, drop into the bin, the bin tips
old += [ev_(31.4, "chalk_write", -33, -0.2, {"dur": 0.35, "strokes": 2}), ev_(32.95, "blanket_rustle", -29, 0.0, {"dur": 0.35, "softness": 0.4, "intensity": 0.8}),
       ev_(33.1, "plush_squeak", -29, 0.0, {"pitch": 0.85}), ev_(34.95, "blanket_rustle", -32, -0.2, {"dur": 0.4, "softness": 0.5, "intensity": 0.6}),
       ev_(35.55, "bonk", -25, 0.1, {"dur": 0.4}), ev_(35.75, "giant_step", -27, 0.1, {"size": 0.25, "surface": "ground"}),
       ev_(35.85, "car_crash", -33, 0.1, {"weight": 0.1})]
# 7. the subway: pages turn in sync, a phone buzzes, every book goes up, they rain down on the floor
for t in [37.5, 38.4, 39.3]: old.append(ev_(t + 0.1, "blanket_rustle", -31, 0.0, {"dur": 0.35, "softness": 0.6, "intensity": 0.6}))
old += [ev_(40.1, "phone_buzz", -23, 0.2, {"dur": 0.45}), ev_(40.35, "blanket_rustle", -27, 0.0, {"dur": 0.4, "softness": 0.3, "intensity": 0.9})]   # v1 BUZZ, THROW
for k, t in enumerate([41.12, 41.25, 41.33, 41.45, 41.52, 41.6, 41.71, 41.8]): old.append(ev_(t, "mattress_sit", -31 - (k % 3), (k % 4 - 1.5) * 0.25))
old = [e for e in old if not (6.2 <= e.get("t", e.get("t0", 0)) < 8.8)]      # v1's shrug beat is now the "NOOOO" beat
ev = []
for e in old:
    if "t" in e:
        t = nt(e["t"])
        if t is not None: e["t"] = t; ev.append(e)
    else:
        a, b = nt(e["t0"]), nt(e["t1"] - 0.02)
        if a is not None and b is not None and b > a: e["t0"], e["t1"] = a, b + 0.02; ev.append(e)

# v2 cues, in video time
# the blast + the crowd's despair
ev += [ev_(M, "poof", -13, 0.0, {"size": 2.4, "dur": 1.4}), ev_(M + 0.02, "distant_boom", -22, 0.0, {"size": 0.7, "dur": 2.0}),
       ev_(5.45, "crowd_noo", -20, 0.0, {"dur": 1.9, "voices": 5})]
# the AI bubble: a stretch, the POP, the arrow coming in, the impact, the street's despair
ev += [ev_(7.85, "low_swell", -30, -0.1, {"dur": 0.5, "pitch": 1.3}), ev_(BUB_POP, "poof", -16, -0.1, {"size": 1.4, "dur": 0.9}),
       ev_(BUB_POP + 0.01, "bonk", -22, -0.1, {"dur": 0.3}), ev_(8.65, "low_swell", -27, -0.2, {"dur": 0.7, "pitch": 0.8}),
       ev_(ARROW_HIT, "giant_step", -16, -0.2, {"size": 1.6, "surface": "ground"}), ev_(ARROW_HIT + 0.02, "car_crash", -22, -0.2, {"weight": 0.6}),
       ev_(ARROW_HIT + 0.05, "distant_boom", -24, 0.0, {"size": 0.8, "dur": 2.2}), ev_(9.75, "crowd_noo", -19, 0.0, {"dur": 2.4, "voices": 8, "pitch": 0.95})]
# the GPU hall: the power sags red, the tech screams, 26 racks clang down like dominoes, the last one slams
ev += [ev_(DC0, "metal_groan", -29, 0.0, {"dur": 0.9, "pitch": 0.7}), ev_(DC0 + 0.4, "crowd_noo", -21, 0.0, {"dur": 2.2, "voices": 1, "pitch": 1.25})]
for k in range(13):
    t = DC0 + 0.35 + k * RACK_DT + 0.42
    ev.append(ev_(t, "metal_clang", -29 + k * 0.5 if k < 12 else -19, (-0.3 if k % 2 else 0.3) * (1 - k / 13), {"size": 0.9 + 0.03 * k, "pitch": 1.2 - 0.03 * k, "dur": 0.9}))
# the Roblox "gg"

# 3 AM: the patrol — kentongan knocks on the grid (bamboo + wood), the kid's water jug, steps, a far dog, a door
for t in [x for x in KT if x < REW + 0.15]:
    near = 50.0 <= t < 53.6
    g = -24 if near else (-33 if t < 50.0 else -28)
    ev.append(ev_(t, "wood_knock", g, 0.2 if near else 0.05, {"pitch": 1.0}))
    ev.append(ev_(t + 0.012, "wood_knock", g - 3, -0.15, {"pitch": 0.62}))
for t in GT:
    if t > D - 0.3: continue
    if t > REW + 0.15: continue
    ev.append(ev_(t, "bonk", -40 + (2 if 50.0 <= t < 53.6 else 0), 0.0, {"dur": 0.18}))
ev += [steps(46.7, REW + 0.15, -36, 5.0, -0.1, 0.1), ev_(47.2, "dog_bark", -40, -0.6, {"pitch": 0.9}), ev_(51.2, "door_open", -31, -0.3)]

# ---------------------------------------------------------------- v3/v4: the bomboclaat lines (our own formant "TTS"), more chaos, the rewind, the giant
def say(t, text, pitch, g=-17, pan=0.0, **kw):
    a = {"text": text, "pitch": pitch}; a.update(kw)
    return ev_(t, "voice", g, pan, a, room=-20)
BOMBO = "b aa m b ow k l aa:3 t"
ev += [say(6.38, BOMBO, 175, contour=[[0, 1.0], [0.45, 0.95], [0.62, 1.35], [1, 0.8]], shout=0.8),            # v4: only "bomboclaat" is spoken
       ev_(ARROW_HIT + 1.94, "car_crash", -24, -0.3, {"weight": 0.45}), ev_(ARROW_HIT + 0.05, "metal_clang", -27, -0.3, {"size": 0.7, "pitch": 1.4, "dur": 0.6}),
       ev_(DC0 + 0.4, "crowd_noo", -21, 0.0, {"dur": 2.2, "voices": 1, "pitch": 1.25}),
       ev_(LAST_RACK + 0.02, "distant_boom", -21, 0.0, {"size": 0.6, "dur": 1.8}), ev_(LAST_RACK + 0.05, "poof", -20, 0.0, {"size": 1.8, "dur": 1.0}),
       say(16.3, BOMBO, 105, contour=[[0, 1.0], [1, 0.8]], speed=0.75, g=-21),
       ev_(21.38, "plush_squeak", -30, 0.1, {"pitch": 1.25}), ev_(24.36, "giant_step", -25, 0.3, {"size": 0.3, "surface": "wood"})]
# the rewind: the music keeps going; a rising swell + a chipmunk chatter of rising squeaks
ev += [ev_(56.65, "low_swell", -27, 0.0, {"dur": 2.7, "pitch": 1.4})]
for k in range(14): ev.append(ev_(56.7 + k * 0.19, "plush_squeak", -32, (k % 3 - 1) * 0.3, {"pitch": 0.8 + 0.06 * k}))
ev += [ev_(57.5, "metal_clang", -30, 0.0, {"size": 0.5, "pitch": 2.2, "dur": 0.4}), ev_(58.8, "poof", -24, 0.0, {"size": 1.2, "dur": 0.6})]
# the giant: he grows through the ceiling, the room groans, TUNG. TUNG. BOMBOCLAAT!!
ev += [ev_(GROW, "giant_step", -16, 0.0, {"size": 1.8, "surface": "wood"}), ev_(GROW + 0.05, "metal_groan", -27, 0.0, {"dur": 0.9, "pitch": 0.6}),
       ev_(GROW + 0.4, "crowd_noo", -19, 0.0, {"dur": 1.3, "voices": 6}),
       ev_(BONKS[0], "metal_clang", -19, 0.25, {"size": 1.4, "pitch": 0.85, "dur": 1.4}),
       ev_(BONKS[1], "metal_clang", -19, 0.25, {"size": 1.4, "pitch": 0.8, "dur": 1.4}),
       say(61.05, BOMBO + " _", 190, contour=[[0, 1.05], [0.45, 1.0], [0.6, 1.45], [1, 0.85]], shout=1.0, g=-15)]

cues = {
    "title": "dh005 v3 - What if Tung Tung Tung Sahur didn't exist? (funny: blast + crowd noooo, bouncy F piano + D-minor panic, the real patrol rhythm at the end)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [66.0, D],
    "stem_gain_db": {"music": -6.0, "sfx": 12.0, "amb": 9.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -15.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0}},
    "sfx_lowpass_hz": 5000,
    "shots": SCENES + [D],
    "ambience": amb,
    "events": ev,
    "music": {"instrument": "piano", "gain_db": 0.0, "reverb_db": -10.0, "pad_db": 2.0, "pad_reverb_db": -5.0,
              "mallet_db": -1.0, "drums_db": -8.0, "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
              "chords": chords, "sections": sections, "melody": melody, "mallet_melody": mallet, "pad": pad,
              "drums": drums, "drum_patterns": drum_patterns, "stings": stings,
              "ducks": [], "auto_duck": {"db": -3.0, "categories": ["prop"], "lookahead": 0.04, "hold": 0.4, "smooth": 0.2, "max_len": 1.0},
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
json.dump(cues, open(sys.argv[1], "w"), indent=1)
print(f"events {len(ev)} (v1 kept {sum(1 for e in old)}), chords {len(chords)}, kentongan {len(KT)}, bedug {len(BT)}")
