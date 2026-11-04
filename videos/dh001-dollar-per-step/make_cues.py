# Generates cues.json for video dh001 (money lane): "What if you earned $1 for every step you took?"
# Run: python3 -I videos/dh001-dollar-per-step/make_cues.py videos/dh001-dollar-per-step/cues.json
#
# Sound identity: "THE STROLL" — a video about walking gets a walking bass. Piano `walk` style in G major at 120 bpm
# (Gmaj7 Em7 Am7 D7, one chord per bar), soft off-beat comps, a drone pad under it so it never leaves a hole.
#   - 0–9.3 s: a quiet kitchen (room tone, a far street through the window, a coffee sip). At 4.3 the phone buzzes
#     twice on the table (new soft `phone_buzz`). A low swell rises into Walt's first step.
#   - 9.275 (step one = +$1): the groove walks in on the footfall, with a two-note mallet "coin" blip + a tiny soft clink.
#   - every beat opens with a 3-note mallet arpeggio that starts one scale step higher than the last — the prices climb.
#   - foley on the picture's own footfall formulas (mirrored from shots.js): the office laps march in sync, the subway
#     stomps, the carrier's steps speeding up, the barrow tip (a paper avalanche), Ron's POOF.
#   - +1 year · Sunday: the groove gives way to a warm, slow piano arp (C – Bm – Am – D → G) for the walk + the hug.
import json, math, sys

D = 68.9
SCENES = [0, 6.0, 8.0, 13.2, 18.4, 23.6, 28.8, 34.0, 39.2, 44.4, 49.6, 55.0, 59.4, 64.9]
STEP_A = 0.19; STEP = 0.38
STEP1, STEP2 = 9.275, 10.475
M = STEP1                                       # the music enters on the first step
WARM = 55.0
HUG, KNOCK, DOOR_OPEN, FADE = 62.2, 61.05, 61.55, 64.3


def footfalls(dist, t0, t1, dt=0.002):
    """times where a gait distance function crosses 0.19 + 0.38 k (rig.js footfalls) — same rule as shots.js trail()"""
    out, prev = [], math.floor((dist(t0) + STEP_A) / STEP)
    t = t0 + dt
    while t <= t1:
        c = math.floor((dist(t) + STEP_A) / STEP)
        if c > prev: out.append(round(t, 3))
        prev = c; t += dt
    return out


# ---------------------------------------------------------------- music
BAR = 2.0
prog = ["Gmaj7", "Em7", "Am7", "D7"]
chords = [[0.2, "Gmaj7"]]
t, k = M, 0
while t < WARM - 0.01:
    chords.append([round(t, 3), prog[k % 4]]); t += BAR; k += 1
chords += [[WARM, "Cmaj7"], [56.5, "Bm7"], [58.0, "Am7"], [59.4, "D7"], [60.9, "Gmaj7"], [62.2, "Cmaj7"], [63.4, "D7"], [64.6, "Gmaj7"], [66.6, "Cmaj7"], [67.6, "Gmaj7"]]

sections = [
    {"t0": M, "t1": WARM, "style": "walk", "vel": [[M, 0.24], [23.6, 0.27], [44.4, 0.29], [WARM, 0.3]], "step": 0.5,
     "bass_hold": 0.95, "bass_vel": 0.95, "comp_vel": 0.4, "stab_hold": 0.8, "swing": 0.12},
    {"t0": WARM, "t1": FADE, "style": "arp", "vel": 0.27, "step": 0.3, "pattern": [0, 1, 2, 3, 2, 1]},
    {"t0": FADE, "t1": D, "style": "arp", "vel": 0.24, "step": 0.45, "pattern": [0, 2, 1, 3, 2, 1]},
]
SCALE = [67, 69, 71, 72, 74, 76, 78, 79, 81, 83, 84, 86, 88]
mallet = [[STEP1 + 0.02, 79, 0.3, 0.12], [STEP1 + 0.1, 86, 0.28, 0.35],           # the coin blip (step one)
          [STEP2 + 0.02, 79, 0.27, 0.12], [STEP2 + 0.1, 86, 0.25, 0.3]]            # step two
for i, s0 in enumerate(SCENES[3:11]):                                                 # one rising arpeggio per beat
    a, b, c = SCALE[i], SCALE[i + 2], SCALE[i + 4]
    mallet += [[s0 + 0.06, a, 0.3, 0.2], [s0 + 0.2, b, 0.28, 0.2], [s0 + 0.34, c, 0.3, 0.45]]
RON_STEP = 47.625
mallet += [[RON_STEP + 0.02, 79, 0.27, 0.12], [RON_STEP + 0.1, 86, 0.25, 0.3]]
melody = [[HUG + 0.05, 83, 0.22, False, 0.9], [HUG + 0.95, 81, 0.21, False, 0.6], [HUG + 1.5, 79, 0.24, False, 1.6],
          [FADE + 0.6, 74, 0.2, False, 1.0], [FADE + 1.6, 79, 0.21, False, 1.2], [FADE + 2.6, 83, 0.2, False, 2.0]]
pad = [{"t0": M - 0.4, "t1": WARM + 0.4, "notes": [43, 55, 62], "level": 0.85, "attack": 0.5, "release": 0.8}]
for i in range(1, len(chords)):
    c0 = chords[i][0]; c1 = chords[i + 1][0] if i + 1 < len(chords) else D - 0.3
    pad.append({"t0": c0, "t1": c1 + 0.35, "chord": chords[i][1], "level": 0.55 if c0 < WARM else 1.6, "attack": 0.15, "release": 0.6})


# ---------------------------------------------------------------- ambience
def amb_(sound, t0, t1, g, args=None, seed=1, fi=0.05, fo=0.06):
    a = {"sound": sound, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": g, "seed": seed}
    if args: a["args"] = args
    return a

amb = [
    amb_("room_tone", 0.0, 13.25, -38, fi=0.3), amb_("city_day", 0.0, 13.25, -50, {"murmur": 0.1, "traffic": 0.5}, 1, fi=0.3),
    amb_("room_tone", 13.2, 18.45, -40), amb_("city_day", 13.2, 18.45, -50, {"murmur": 0.5, "traffic": 0.3}, 2),
    amb_("cabin_hum", 18.4, 23.65, -46), amb_("traffic_flow", 18.4, 23.65, -48, None, 3),
    amb_("city_day", 23.6, 28.85, -40, {"murmur": 0.2, "traffic": 0.7}, 4), amb_("wind", 23.6, 28.85, -50, {"darkness": 0.6, "gust": 0.3, "whistle": 0.0}, 5),
    amb_("city_day", 28.8, 34.05, -46, {"murmur": 0.0, "traffic": 0.4}, 6), amb_("wind", 28.8, 34.05, -50, {"darkness": 0.6, "gust": 0.2, "whistle": 0.0}, 7),
    amb_("crowd_cheer", 34.0, 39.25, -42, {"excite": 0.5}, 8), amb_("applause", 34.0, 39.25, -44, {"density": 18.0}, 9),
    amb_("room_tone", 39.2, 44.45, -40), amb_("lamp_hum", 39.2, 44.45, -56), amb_("city_day", 39.2, 44.45, -47, {"murmur": 0.7, "traffic": 0.0}, 10),
    amb_("room_tone", 44.4, 49.65, -40), amb_("city_day", 44.4, 46.5, -50, {"murmur": 0.8, "traffic": 0.0}, 11, fo=0.3),   # the TV murmur
    amb_("city_day", 49.6, 55.05, -42, {"murmur": 0.4, "traffic": 0.5}, 12),
    amb_("city_day", 55.0, 64.9, -47, {"murmur": 0.0, "traffic": 0.35}, 13), amb_("wind", 55.0, 64.9, -51, {"darkness": 0.7, "gust": 0.15, "whistle": 0.0}, 14),
    amb_("room_tone", 64.9, D, -46, fi=0.3, fo=1.0),
]


# ---------------------------------------------------------------- events
def ev_(t, sound, g, pan=0.0, args=None, room=-16):
    e = {"t": round(t, 3), "sound": sound, "gain_db": g, "pan": pan, "room": room}
    if args: e["args"] = args
    return e

def steps(times, g, pan=0.0, weight=1.0):
    return [ev_(tt, "footstep", g + (-1.0 if j % 2 else 0.0), pan + (0.04 if j % 2 else -0.04), {"weight": weight, "scuff": 0.8}) for j, tt in enumerate(times)]

def coin(t, g=-31):        # a tiny soft clink as the coin pops (low-passed inside the generator)
    return ev_(t + 0.02, "metal_clang", g, 0.1, {"size": 0.18, "pitch": 2.6, "dur": 0.5}, -18)

ev = []
# 1. kitchen: a sip, the phone buzzes twice, the notification, the swell into step one
ev += [ev_(3.45, "slurp", -31, 0.0, {"dur": 0.6}), ev_(4.3, "phone_buzz", -26, 0.0, {"dur": 0.45}), ev_(4.95, "phone_buzz", -27, 0.0, {"dur": 0.45}),
       ev_(6.15, "plush_squeak", -29, 0.0, {"pitch": 0.6}), ev_(8.2, "mattress_sit", -32, 0.0), ev_(STEP1 - 1.0, "low_swell", -25, 0.0, {"dur": 1.0, "pitch": 0.75})]
ev += steps([STEP1, STEP2], -24) + [coin(STEP1, -29), coin(STEP2, -30)]
ev += [{"sound": "footsteps", "t0": 11.15, "t1": 13.15, "pan0": 0.1, "pan1": 0.3, "gain_db": -27, "rate": 3.6}]
# 2. office: seven people lap the desk in step (same gait phase): one shared footfall per 0.38 m
OV = 1.55
ev += steps(footfalls(lambda t: OV * (t - 13.2) + 4, 13.25, 18.35), -25, 0.0, 1.1)
ev += [ev_(15.3, "blanket_rustle", -28, -0.2, {"dur": 0.8, "softness": 0.3, "intensity": 0.7}), ev_(16.2, "blanket_rustle", -29, 0.2, {"dur": 1.0, "softness": 0.3, "intensity": 0.7}),
       ev_(17.2, "blanket_rustle", -28, 0.0, {"dur": 1.1, "softness": 0.3, "intensity": 0.8})]
# 3. subway: twelve people stomp in sync — footfall when the march phase hits π/2 + kπ (shots.js subPh)
def subPh(t):
    u = t - 18.4
    return u * 2 * math.pi * 1.5 + max(0.0, u - 2.6) ** 2 * 2 * math.pi * 0.35
stomps = footfalls(lambda t: subPh(t) * STEP / math.pi, 18.45, 23.55)
for j, ts in enumerate(stomps):
    ev.append(ev_(ts, "giant_step", -27 + min(4, j * 0.12), ((j % 2) - 0.5) * 0.2, {"size": 0.28, "surface": "ground"}, -14))
# 4. car lot: passers' steps; the tube man flops (a soft fwump + a thud)
ev += [{"sound": "footsteps", "t0": 24.6, "t1": 28.6, "pan0": -0.4, "pan1": 0.4, "gain_db": -29, "rate": 4.3},
       ev_(27.3, "blanket_rustle", -26, 0.3, {"dur": 0.6, "softness": 0.6, "intensity": 0.9}), ev_(27.85, "giant_step", -22, 0.35, {"size": 0.45, "surface": "ground"}),
       ev_(28.0, "plush_squeak", -28, 0.35, {"pitch": 0.55})]
# 5. mail: her footfalls from the same formula as shots.js (she speeds up when the dog bursts out), barks
def mailX(t):
    u = max(0.0, t - 28.8); v = max(0.0, u - 2.4)
    return -6.4 + 1.35 * u + 0.45 * v * v
ev += steps(footfalls(lambda t: mailX(t) + 10, 28.85, 33.95), -27, 0.1)
for tb, pch in ((31.45, 1.05), (31.75, 1.1), (32.2, 1.0), (32.5, 1.1), (33.0, 1.05), (33.35, 1.12)):
    ev.append(ev_(tb, "dog_bark", -26, -0.25, {"pitch": pch}))
# 6. race: the pitter-patter of 12 people tiptoeing at 7 steps a second each
ev += [{"sound": "footsteps", "t0": 34.05, "t1": 39.15, "pan0": -0.2, "pan1": 0.2, "gain_db": -32, "rate": 14.0},
       {"sound": "footsteps", "t0": 34.1, "t1": 39.15, "pan0": 0.2, "pan1": -0.2, "gain_db": -33, "rate": 11.0}]
# 7. market: power-walking shoppers; the price climbs (a rising soft boop each jump), the shelves empty in a rush
ev += [{"sound": "footsteps", "t0": 39.25, "t1": 44.35, "pan0": -0.3, "pan1": 0.3, "gain_db": -30, "rate": 8.0}]
for j, tp in enumerate((40.6, 41.1, 41.45, 41.75)):
    ev.append(ev_(tp, "plush_squeak", -29, 0.3, {"pitch": 0.6 + 0.07 * j}))
ev += [ev_(42.4 + j * 0.28, "blanket_rustle", -30, ((j % 3) - 1) * 0.3, {"dur": 0.35, "softness": 0.4, "intensity": 0.7}) for j in range(6)]
ev += [ev_(43.2, "low_swell", -26, 0.0, {"dur": 0.8, "pitch": 0.8})]
# 8. couch: three rocks (cushion creaks), POOF, the first step
for tr in (44.9, 45.7, 46.5):
    ev.append(ev_(tr - 0.1, "mattress_sit", -29, 0.0))
ev += [ev_(46.7, "giant_step", -24, 0.0, {"size": 0.4, "surface": "wood"}), ev_(46.72, "blanket_rustle", -27, 0.0, {"dur": 0.7, "softness": 0.5, "intensity": 0.9})]
ev += steps([RON_STEP], -24) + [coin(RON_STEP, -29)]
ev += [{"sound": "footsteps", "t0": 48.7, "t1": 49.55, "pan0": 0.0, "pan1": -0.2, "gain_db": -27, "rate": 3.2}]
# 9. barrow: Walt's steps, the tip, the paper avalanche
ev += [{"sound": "footsteps", "t0": 49.65, "t1": 52.35, "pan0": -0.4, "pan1": 0.0, "gain_db": -27, "rate": 3.4},
       ev_(52.75, "low_swell", -27, 0.0, {"dur": 0.5, "pitch": 0.8}), ev_(53.2, "giant_step", -22, 0.1, {"size": 0.35, "surface": "ground"})]
ev += [ev_(53.05 + j * 0.22, "blanket_rustle", -27, 0.15 + 0.05 * j, {"dur": 0.6, "softness": 0.3, "intensity": 0.8}) for j in range(5)]
# 10. Sunday walk: his steps (shots.js walkX: −31 + 1.35 (t − 55), dist = x + 40), up the porch, three knocks, the door, the hug
ev += steps(footfalls(lambda t: -31.0 + 1.35 * (t - 55.0) + 40, 55.05, 59.35), -27, 0.0, 0.9)
ev += [{"sound": "footsteps", "t0": 59.6, "t1": 60.8, "pan0": 0.0, "pan1": 0.0, "gain_db": -27, "rate": 2.4}]
ev += [ev_(KNOCK + j * 0.16, "bonk", -28 - j, 0.0, {"dur": 0.4}) for j in range(3)]
ev += [ev_(DOOR_OPEN, "door_open", -30, 0.0, {"creak": 0.3}), ev_(HUG - 0.1, "blanket_rustle", -30, 0.0, {"dur": 0.6, "softness": 0.6, "intensity": 0.5}),
       ev_(HUG - 0.3, "low_swell", -28, 0.0, {"dur": 1.2, "pitch": 0.9})]

cues = {
    "title": "dh001 - What if you earned $1 for every step you took? (money: walking-bass stroll in G, coin blips, footfall foley)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [67.9, D],
    "stem_gain_db": {"music": -6.0, "sfx": 12.0, "amb": 9.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -15.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0}},
    "sfx_lowpass_hz": 5000,
    "shots": SCENES + [D],
    "ambience": amb,
    "events": ev,
    "music": {"instrument": "piano", "gain_db": 0.0, "reverb_db": -10.0, "pad_db": 2.0, "pad_reverb_db": -5.0,
              "mallet_db": -2.0, "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
              "chords": chords, "sections": sections, "melody": melody, "mallet_melody": mallet, "pad": pad,
              "stings": [{"t": STEP1, "midi": 31, "vel": 0.28, "hold": 1.2}, {"t": 27.85, "midi": 31, "vel": 0.24, "hold": 0.9},
                         {"t": 43.2, "midi": 31, "vel": 0.24, "hold": 0.9}, {"t": 46.7, "midi": 31, "vel": 0.25, "hold": 0.9},
                         {"t": 53.2, "midi": 31, "vel": 0.25, "hold": 1.1}],
              "ducks": [], "auto_duck": {"db": -3.0, "categories": ["prop"], "lookahead": 0.04, "hold": 0.4, "smooth": 0.2, "max_len": 1.0},
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
json.dump(cues, open(sys.argv[1], "w"), indent=1)
print(f"events {len(ev)}, office steps {len(footfalls(lambda t: OV * (t - 13.2) + 4, 13.25, 18.35))}, stomps {len(stomps)}")
