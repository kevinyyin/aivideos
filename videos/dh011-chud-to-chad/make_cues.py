# Generates cues.json for video dh011: "What if you went from chud to chad?"
# Run: python3 -I videos/dh011-chud-to-chad/make_cues.py videos/dh011-chud-to-chad/cues.json
#
# Sound identity: "GLOW-UP MONTAGE" — an original 80s training-montage synthwave at 120 bpm (beat 0 = the first CLUNK of the jaw):
# a plucked octave-bouncing synth bass in 8ths with off-beat stabs (the `disco` groove on `pluck`) over Am – F – C – G, a gated
# kick on 1 + 3 (+ the "and" of 3) and a big-room clap on 2 + 4, warm saw pads over one long drone (no gaps), and heroic synth BRASS
# (synth.py `brass_melody`, new in dh011): a fanfare that opens each glow-up place, chord stabs on every gag (CLUNK, POP, BONK,
# BEND, SNIP, SPLIT…). It KEY-CHANGES UP a whole step at the gym (Bm) and again on the mogging (C#m), each with a tom fill. The Sun
# gets a sad-trombone "wah-wah-wah-wahh" on the brass; the mirrors shatter on braams + booms; "only one reflection left" thins to a
# bare arp; the chair takes you back with a falling brass power-down and the groove returns small and cozy in A minor for the card.
# Quiet open: a 3 AM room tone, keyboard clicks, the can pyramid clattering down, a notification boop. No real song, no lyrics,
# no voice lines (nothing is spoken: the reactions are cartoon "ooh"s from synth.py's crowd_noo).
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, "shots.js")).read()
T = {k: float(v) for k, v in re.findall(r"\b([A-Z][A-Z0-9_]*): (-?\d+(?:\.\d+)?)", src[src.index("export const TIMES"):src.index("};", src.index("export const TIMES"))])}
D, END_IN = 69.6, 65.6
SCENES = [0, 3.4, 6.0, 8.2, 11.75, 13.6, 16.4, 19.6, 22.2, 25.0, 27.6, 30.4, 35.8, 37.6, 39.4, 41.2, 46.6, 48.4, 50.4, 52.2, 54.0, 56.4, 57.4, 58.4, 59.6, 61.4, D]
M = T["MEW1"]; BEAT = 0.5; BAR = 4 * BEAT
beat_t = lambda n: M + n * BEAT
SHR = [T["SHR0"] + d for d in (0, 0.6, 1.1, 1.5, 1.85)]
K1, K2, QUIET, BACK = M + 8 * BAR, M + 16 * BAR, M + 25 * BAR, T["R0"]     # 25.2 Bm · 41.2 C#m · 59.2 thin · 62.8 back home

# ---------------------------------------------------------------- music
KEYS = [(M, K1, 0, ["Am", "F", "C", "G"]), (K1, K2, 2, ["Bm", "G", "D", "A"]), (K2, BACK, 4, ["C#m", "A", "E", "B"])]
def key_at(t):
    for a, b, up, _ in KEYS:
        if a - 0.01 <= t < b: return up
    return 0
chords = []
def run(t0, t1, prog, bar=BAR):
    t, k = t0, 0
    while t < t1 - 0.01:
        chords.append([round(t, 3), prog[k % len(prog)]]); t += bar; k += 1
for a, b, _, prog in KEYS: run(a, b, prog)
run(BACK, D, ["Am", "F", "C", "G"], 2.4)                               # home: the chud key, a bit slower
sections = [
    {"t0": M, "t1": QUIET, "style": "disco", "step": 0.25, "vel": [[M, 0.3], [K1, 0.33], [K2, 0.36], [QUIET, 0.36]], "stab_vel": 0.32, "stab_hold": 0.55, "bass_hold": 0.85},
    {"t0": QUIET, "t1": BACK, "style": "arp", "step": 0.125, "vel": 0.24, "pattern": [0, 1, 2, 3, 2, 1]},
    {"t0": BACK, "t1": D, "style": "arp", "step": 0.3, "vel": [[BACK, 0.3], [D, 0.22]], "pattern": [0, 2, 1, 3, 2, 1]},
]
# heroic brass: a fanfare per place + chord stabs on the gags (root = A3 + key)
brass = []
def fan(t, up=None, v=0.42, slow=1.0):
    u = key_at(t) if up is None else up; r = 69 + u
    for dt, m, ln, vv in [(0, 7, 0.2, 0.9), (0.25, 7, 0.2, 0.85), (0.5, 12, 0.85, 1.0), (1.5, 10, 0.2, 0.85), (1.75, 12, 0.2, 0.9), (2.0, 15, 1.1, 1.0)]:
        brass.append([round(t + dt * slow, 3), r + m - 12, v * vv, ln * slow])
def stab(t, v=0.45, up=None, top=0):
    u = key_at(t) if up is None else up; r = 57 + u
    for m in (0, 7, 12 + top):
        brass.append([round(t, 3), r + m, v, 0.32])
for t in [T["MEW1"], T["MEW2"], T["MEW3"]]: stab(t, 0.36 + 0.05 * [T["MEW1"], T["MEW2"], T["MEW3"]].index(t), top=[0, 3, 7][[T["MEW1"], T["MEW2"], T["MEW3"]].index(t)])
stab(T["SLAM"], 0.55)
for i, t in enumerate([T["POP1"], T["POP2"], T["POP3"]]): stab(t, 0.36, top=[0, 3, 7][i])
stab(T["BONK"] + 0.02, 0.5, top=12)
fan(19.65); stab(T["SCULPT"] + 0.85, 0.42, top=7); stab(T["SNAP"], 0.4)
fan(K1 + 0.02, v=0.46); stab(T["BEND1"], 0.42); stab(T["BEND2"], 0.48, top=3); stab(T["PLATES"] + 0.42, 0.42)
fan(30.45, v=0.44, slow=2.0)                                             # the slow-motion walk: the hero theme at half speed
stab(T["NOD"] + 0.08, 0.4); stab(T["CUT"], 0.42, top=3); stab(T["SPLIT"], 0.46, top=7)
fan(K2 + 0.02, v=0.46)
for i, t in enumerate(SHR): brass.append([round(t, 3), 69 + 4 + [7, 5, 3, 2, 0][i], 0.3, 0.22])   # a falling blip per shrink
stab(T["ALL"], 0.45, top=7); stab(T["SSHR"], 0.42, top=3); stab(T["SINK"], 0.48); stab(T["HIDE"], 0.4, top=7)
r = 69 + 4 - 12                                                          # the Sun: a sad trombone on the brass (C#m)
for i, (dt, m, ln) in enumerate([(0, 7, 0.32), (0.36, 6, 0.32), (0.72, 5, 0.32), (1.08, 4, 0.75)]):
    brass.append([round(T["SET"] + dt, 3), r + m, 0.42, ln])
fan(54.05, v=0.42)
stab(T["SHATTER"], 0.52, top=12); stab(T["SHB"], 0.46, top=7); stab(T["SHG"], 0.46, top=3)
for i, m in enumerate([81, 76, 69, 64, 57]): brass.append([round(BACK + 0.12 * i, 3), m, 0.4 - 0.04 * i, 0.16 if i < 4 else 0.6])   # power-down
for i, (dt, m, ln) in enumerate([(0, 64, 0.3), (0.3, 64, 0.3), (0.6, 69, 1.4), (2.4, 67, 0.3), (2.7, 69, 0.3), (3.0, 72, 1.6)]):
    brass.append([round(END_IN + 0.1 + dt, 3), m, 0.28, ln])                                        # the card: the theme, small and cozy
# mallet sparkle on the sculpt + the gloss (nothing on the music bus before the premise: it would start the music early)
mallet = [[T["SCULPT"] + 0.06 * i, 81 + [0, 4, 7, 12, 16, 19][i], 0.2, 0.2] for i in range(6)]
mallet += [[T["GLOSS"] + 0.25 + 0.32 * k, 88 + (k % 2) * 3, 0.16, 0.25] for k in range(4)]

DRONE = {0: [45, 52, 57], 2: [47, 54, 59], 4: [49, 56, 61]}
pad = []
for a, b, up, _ in KEYS: pad.append({"t0": a - (0.4 if a == M else 0.2), "t1": b + 0.4, "notes": DRONE[up], "level": 0.85, "attack": 0.3, "release": 0.8})
pad.append({"t0": BACK - 0.2, "t1": D - 0.2, "notes": DRONE[0], "level": 0.95, "attack": 0.3, "release": 0.8})
for i, (c0, ch) in enumerate(chords):
    c1 = chords[i + 1][0] if i + 1 < len(chords) else D - 0.3
    pad.append({"t0": c0, "t1": c1 + 0.35, "chord": ch, "level": 1.1 if QUIET <= c0 < BACK else 1.4 if c0 >= BACK else 0.55, "attack": 0.15, "release": 0.6})
for t, up in [(M, 0), (T["SHATTER"], 4)]:
    pad.append({"t0": t, "t1": t + 2.0, "notes": [x - 12 for x in DRONE[up]] + DRONE[up], "level": 1.3, "attack": 0.1, "release": 0.9, "cutoff": 900, "hp": 30})

drums = [[M + 0.02, 0.6, "boom"]]
for k, v in [("SLAM", 0.55), ("BONK", 0.35), ("BEND2", 0.4), ("SPLIT", 0.35), ("ALL", 0.4), ("SINK", 0.5), ("SHATTER", 0.6), ("SHB", 0.45), ("SHG", 0.45), ("FLOOR", 0.4)]:
    drums.append([T[k] + 0.02, v, "boom"])
for t0 in (K1 - BAR / 2, K2 - BAR / 2):                                  # tom fills into each key change
    drums += [[round(t0 + 0.125 * i, 3), 0.25 + 0.06 * i, "tom"] for i in range(8)]
    drums.append([t0 + BAR / 2 + 0.01, 0.5, "boom"])
KICK = [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0.7, 0, 0, 0, 0, 0]               # 16ths: 1, 3, the "and" of 3
CLAP = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]                  # 2 + 4 (a big-room clap through the hall)
drum_patterns = [{"t0": M + BAR, "t1": QUIET, "step": BEAT / 4, "pattern": KICK, "vel": [[M + BAR, 0.38], [K2, 0.44]], "kind": "kick"},
                 {"t0": M + BAR, "t1": QUIET, "step": BEAT / 4, "pattern": CLAP, "vel": [[M + BAR, 0.3], [K2, 0.36]], "kind": "clap"},
                 {"t0": BACK + 2.4, "t1": D - 0.4, "step": 0.3, "pattern": [1, 0, 0, 0, 0, 0, 0.6, 0], "vel": 0.3, "kind": "kick"}]


# ---------------------------------------------------------------- ambience
def amb_(sound, t0, t1, g, args=None, seed=1, fi=0.05, fo=0.06):
    a = {"sound": sound, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": g, "seed": seed}
    if args: a["args"] = args
    return a
amb = [
    amb_("room_tone", 0.0, 19.62, -28, None, 1, fi=0.3), amb_("city_day", 0.0, 13.62, -51, {"murmur": 0.0, "traffic": 0.3}, 2, fi=0.3),   # 3 AM bedroom
    amb_("city_day", 13.6, 19.62, -50, {"murmur": 0.2, "traffic": 0.4}, 3),                                                               # morning
    amb_("room_tone", 19.6, 25.02, -35, None, 4), amb_("city_day", 19.6, 25.02, -47, {"murmur": 0.5, "traffic": 0.3}, 5),                 # barber
    amb_("room_tone", 25.0, 30.42, -36, None, 6), amb_("city_day", 25.0, 30.42, -48, {"murmur": 0.6, "traffic": 0.0}, 7),                 # gym
    amb_("city_day", 30.4, 39.42, -43, {"murmur": 0.6, "traffic": 0.5}, 8), amb_("wind", 30.4, 35.82, -33, {"darkness": 0.45, "gust": 0.8, "whistle": 0.1}, 9),
    amb_("dry_leaves", 30.4, 35.82, -42, {"density": 1.4}, 10),
    amb_("applause", T["CUT"] + 0.05, 39.42, -31, {"density": 30.0}, 11, fi=0.2), amb_("crowd_cheer", T["CUT"] + 0.1, 39.42, -35, {"excite": 0.8}, 12, fi=0.2),
    amb_("city_day", 39.4, 41.22, -47, {"murmur": 0.1, "traffic": 0.3}, 13), amb_("dry_leaves", 39.4, 41.22, -48, None, 14),                # suburb yard
    amb_("cabin_hum", 41.2, 46.62, -33, None, 15), amb_("traffic_flow", 41.2, 46.62, -46, None, 16),                                       # subway
    amb_("city_day", 46.6, 48.42, -46, {"murmur": 0.2, "traffic": 0.2}, 17),                                                               # park
    amb_("wind", 48.4, 50.42, -34, {"darkness": 0.6, "gust": 0.4, "whistle": 0.05}, 18), amb_("wind", 52.2, 54.02, -36, {"darkness": 0.7, "gust": 0.3, "whistle": 0.0}, 19),
    amb_("room_tone", 54.0, 56.42, -34, None, 20), amb_("room_tone", 56.4, 57.42, -36, None, 21), amb_("room_tone", 57.4, 58.42, -36, None, 22),
    amb_("room_tone", 59.6, D, -32, None, 23), amb_("city_day", 59.6, D, -56, {"murmur": 0.0, "traffic": 0.3}, 24),                        # 3 AM again
    # (v2) the flies: loud in the quiet open, under the music after, gone when they flee the barber, back with the chair
    amb_("fly_buzz", 0.0, T["MEW1"] + 0.3, -29, {"flies": 5}, 26, fi=0.3, fo=0.5), amb_("fly_buzz", T["MEW1"], T["SCULPT"] + 0.45, -31, {"flies": 5}, 27, fi=0.4, fo=0.45),
    amb_("fly_buzz", T["R0"] + 0.4, D, -29, {"flies": 5}, 28, fi=0.9, fo=0.3),
]


# ---------------------------------------------------------------- events
def ev_(t, sound, g, pan=0.0, args=None, room=None, hall=None):
    e = {"t": round(t, 3), "sound": sound, "gain_db": g, "pan": pan}
    if room is not None: e["room"] = room
    if hall is not None: e["hall"] = hall
    if args: e["args"] = args
    return e
def clatter(t0, n, g, span=0.45, pan=0.0, size=(0.16, 0.3), pitch=(2.2, 3.0)):
    return [ev_(t0 + span * ((k * 0.618) % 1.0), "metal_clang", g - (k % 3), pan + ((k % 5) - 2) * 0.12, {"size": size[0] + (size[1] - size[0]) * ((k * 0.37) % 1), "pitch": pitch[0] + (pitch[1] - pitch[0]) * ((k * 0.71) % 1)}) for k in range(n)]
def ooh(t, g, voices=2, pitch=1.2, dur=0.8, pan=0.0):
    return ev_(t, "crowd_noo", g, pan, {"dur": dur, "voices": voices, "pitch": pitch})

ev = [ev_(0.3, "keyboard_type", -28, -0.1, {"dur": 2.9, "rate": 9.0}), ev_(3.45, "keyboard_type", -27, 0.0, {"dur": 2.6, "rate": 10.5}),
      ev_(T["GRAB"] - 0.1, "blanket_rustle", -32, 0.2, {"dur": 0.4, "softness": 0.8, "intensity": 0.4})]
ev += clatter(T["TOPPLE"] + 0.25, 11, -23, 0.6, 0.25)                                 # the can pyramid comes down
ev += [ev_(T["SLAM"] + 0.35 + 0.06 * k, "wood_knock", -36, ((k % 5) - 2) * 0.2, {"pitch": 2.2 + 0.1 * (k % 4), "dur": 0.08}) for k in range(8)]   # flies hit the floor
ev += [ev_(T["CARD"], "plush_squeak", -24, 0.2, {"pitch": 0.9, "dur": 0.15}), ev_(T["CARD"] + 0.02, "phone_buzz", -27, 0.2, {"dur": 0.12})]
for i, t in enumerate([T["MEW1"], T["MEW2"], T["MEW3"]]):                            # CLUNK · CLUNK · CLUNK
    ev += [ev_(t, "giant_step", -24 + 2 * i, 0.0, {"size": 0.3 + 0.12 * i, "surface": "wood"}), ev_(t + 0.01, "wood_knock", -26 + i, 0.0, {"pitch": 0.6 - 0.05 * i, "dur": 0.4})]
ev += [ev_(T["SLAM"], "car_crash", -21, 0.0, {"weight": 0.2}), ev_(T["SLAM"] + 0.02, "wood_snap", -19, 0.0, {"size": 1.1}),
       ev_(T["SLAM"] + 0.05, "keyboard_type", -27, 0.1, {"dur": 0.7, "rate": 32.0}), ev_(T["SLAM"] + 0.08, "metal_clang", -29, -0.2, {"size": 0.6, "pitch": 1.2})]
ev += [ev_(13.75, "snore", -27, 0.2, {"dur": 2.1, "size": 0.9}), ev_(T["WAKE"], "boing", -20, 0.2, {"dur": 0.6, "pitch": 1.0})]
for i, t in enumerate([T["POP1"], T["POP2"], T["POP3"]]):                            # three spine POPs
    ev += [ev_(t, "wood_snap", -24, 0.0, {"size": 0.12, "dur": 0.3}), ev_(t + 0.01, "plush_squeak", -27, 0.0, {"pitch": 0.55 + 0.08 * i, "dur": 0.14})]
ev += [ev_(T["BONK"], "bonk", -19, 0.0, {"dur": 0.45}), ev_(T["BONK"] + 0.01, "metal_clang", -28, 0.0, {"size": 0.35, "pitch": 1.8})]
# barber: clippers buzz, the sculpt swell, the comb SNAP, the gloss, the magazines lower
ev += [ev_(19.75, "phone_buzz", -29, -0.2, {"dur": 0.7}), ev_(T["CLIP"], "phone_buzz", -27, -0.2, {"dur": 0.35}),
       ev_(T["SCULPT"], "low_swell", -25, 0.0, {"dur": 0.9, "pitch": 1.25}), ev_(T["SCULPT"] + 0.1, "blanket_rustle", -29, 0.0, {"dur": 0.6, "softness": 0.6, "intensity": 0.5}),
       ev_(T["SNAP"], "wood_snap", -22, -0.2, {"size": 0.16, "dur": 0.35}), ev_(T["SNAP"] + 0.3, "plush_place", -31, -0.3),
       ev_(T["MAGS"], "blanket_rustle", -30, 0.3, {"dur": 0.35, "softness": 0.7, "intensity": 0.6}), ooh(T["MAGS"] + 0.15, -29, 2, 1.3, 0.7, 0.3)]
ev += [ev_(19.75, "poof", -30, -0.3, {"size": 0.45, "dur": 0.6}), ev_(21.05, "poof", -31, -0.3, {"size": 0.45, "dur": 0.6})]   # gas-mask breaths
# the fat melts in four squishy PFFFTs (sweat + puff)
for i, g in enumerate([T["CURL"], T["BEND1"], T["TOSS"], T["LIFT"]]):
    ev += [ev_(g, "poof", -23 - 1.5 * i, 0.0, {"size": 0.8, "dur": 0.6})]
    if i in (0, 3): ev.append(ev_(g + 0.02, "boing", -27, 0.0, {"dur": 0.5, "pitch": 0.5}))
# gym: the curl bends (groan + bonk), the toss lands off screen, the barbell sags, plates drop and roll into the kettlebells
ev += [ev_(T["BEND1"], "metal_groan", -24, 0.2, {"dur": 0.5, "pitch": 1.4}), ev_(T["BEND1"] + 0.05, "bonk", -26, 0.2, {"dur": 0.3}),
       ev_(T["TOSS"] + 0.5, "metal_clang", -24, 0.5, {"size": 0.8, "pitch": 1.0}),
       ev_(T["BEND2"], "metal_groan", -21, 0.0, {"dur": 0.9, "pitch": 0.9}), ooh(T["BEND2"] + 0.3, -28, 3, 1.0, 0.9),
       ev_(T["PLATES"] + 0.42, "metal_clang", -21, -0.4, {"size": 1.1, "pitch": 0.9}), ev_(T["PLATES"] + 0.44, "metal_clang", -21, 0.4, {"size": 1.1, "pitch": 0.95})]
for i in range(8): ev.append(ev_(T["KETTLE"] + 0.09 * i, "metal_clang", -27 - (i % 2), 0.3 + 0.05 * i, {"size": 0.5, "pitch": 1.2 + 0.04 * i}))
for t in [25.3, 26.7, 28.0, 29.0]: ev.append(ev_(t, "metal_clang", -38, -0.5, {"size": 0.4, "pitch": 1.5}))     # the gym, somewhere
# the slow-motion walk: a big soft stomp per footfall (dist = 0.53 m/s → footfalls at 0.19 + 0.38 k), a dog, a cup, the umbrella
u = 0.19 / 0.53
while 30.4 + u < 35.8:
    ev.append(ev_(30.4 + u, "giant_step", -27, 0.0, {"size": 0.28})); u += 0.38 / 0.53
ev += [ev_(T["DOG"] + 0.35, "dog_bark", -29, 0.4, {"pitch": 0.8}), ev_(T["CUP"] + 0.55, "bonk", -30, -0.3, {"dur": 0.2}),
       ev_(T["UMBR"], "blanket_rustle", -24, -0.3, {"dur": 0.9, "softness": 0.4, "intensity": 1.0, "strokes": 2})]
# bread: the slices fall (soft wooden thocks), ribbon: SNIP + applause, the log: CRACK
for k in range(7): ev.append(ev_(T["NOD"] + 0.08 + abs(k - 3) * 0.025, "wood_knock", -28, 0.0, {"pitch": 1.4, "dur": 0.15}))
ev += [ooh(T["NOD"] + 0.25, -29, 1, 1.25, 0.6, -0.2), ev_(T["CUT"], "wood_snap", -24, 0.0, {"size": 0.1, "dur": 0.25}),
       ev_(T["THROW"], "blanket_rustle", -32, -0.3, {"dur": 0.3, "softness": 0.7, "intensity": 0.5}),
       ev_(T["SPLIT"], "wood_snap", -19, 0.1, {"size": 0.85}), ooh(T["SPLIT"] + 0.15, -28, 1, 0.95, 0.7, -0.3),
       ev_(T["SPLIT"] + 0.55, "giant_step", -30, -0.4, {"size": 0.2, "surface": "wood"}), ev_(T["SPLIT"] + 0.62, "giant_step", -30, 0.4, {"size": 0.2, "surface": "wood"})]
# the subway: wheel clacks; each shrink is a boing (falling), then the whole car
t = 41.35
while t < 46.5: ev.append(ev_(t, "wood_knock", -39, 0.0, {"pitch": 0.7, "dur": 0.2})); t += 0.62
for i, ts in enumerate(SHR): ev += [ev_(ts, "boing", -22, (0.3 if i % 2 == 0 else -0.3), {"dur": 0.45, "pitch": 1.05 - 0.07 * i}), ooh(ts + 0.1, -31, 1, 1.6, 0.4, (0.3 if i % 2 == 0 else -0.3))]
ev += [ev_(T["ALL"] + 0.03 * k, "boing", -25, ((k % 3) - 1) * 0.4, {"dur": 0.4, "pitch": 0.9 + 0.05 * k}) for k in range(4)] + [ooh(T["ALL"] + 0.15, -26, 4, 1.7, 0.9)]
# landmarks: the statue, the mountain, the Moon
ev += [ev_(T["SSHR"], "boing", -20, 0.2, {"dur": 0.6, "pitch": 0.65}), ev_(T["SSHR"] + 0.02, "metal_groan", -29, 0.2, {"dur": 0.4, "pitch": 0.5}),
       ev_(T["SINK"], "distant_boom", -23, 0.0, {"size": 0.8, "dur": 2.0}), ooh(T["SINK"] + 0.4, -28, 2, 1.1, 0.8, 0.2),
       ooh(T["HIDE"] - 0.2, -26, 1, 1.4, 0.6, 0.3), ev_(T["HIDE"] + 0.1, "boing", -25, 0.3, {"dur": 0.5, "pitch": 0.55})]
amb.append(amb_("rocket_rumble", T["SINK"], T["SINK"] + 1.1, -29, {"rise": 0.3}, 25, fi=0.1, fo=0.3))
# the mirrors: crack, SHATTER (a cluster of soft clinks + a puff), the barbershop, the gym, glints over Earth
ev += [ev_(T["CRACK"], "wood_snap", -27, -0.3, {"size": 0.1, "dur": 0.2}), ev_(T["CRACK"] + 0.45, "wood_snap", -27, -0.3, {"size": 0.12, "dur": 0.2})]
for t0, pan in [(T["SHATTER"], -0.3), (T["SHB"], 0.0), (T["SHG"], 0.0)]:
    ev += [ev_(t0, "poof", -24, pan, {"size": 0.6, "dur": 0.5})] + clatter(t0 + 0.02, 16, -29, 0.45, pan, (0.1, 0.22), (2.5, 3.2))
ev += [ooh(T["SHB"] + 0.15, -28, 2, 1.2, 0.6), ooh(T["SHG"] + 0.15, -27, 3, 1.0, 0.6)]
ev += [ev_(T["GLINT"] + 0.045 * k, "metal_clang", -38, ((k * 0.37) % 1 - 0.5) * 0.8, {"size": 0.1, "pitch": 3.0}) for k in range(20)]
# the chair takes you back: sit, deflate, the jaw block THUNKs, the hood boings, the cans clink back up, CONTINUE?, typing
ev += [ev_(T["SIT"] + 0.35, "mattress_sit", -24, 0.0), ev_(T["SIT"] + 0.4, "floorboard_creak", -30, 0.0, {"dur": 0.35}),
       ev_(T["R0"], "poof", -24, 0.0, {"size": 0.5, "dur": 0.6}), ev_(T["R0"] + 0.05, "boing", -24, 0.0, {"dur": 0.6, "pitch": 0.7}),
       ev_(T["R0"] + 0.06, "low_swell", -26, 0.0, {"dur": 0.6, "pitch": 0.7}), ev_(T["R0"] + 0.12, "metal_groan", -26, 0.0, {"dur": 0.6, "pitch": 0.6}),
       ev_(T["FLOOR"], "giant_step", -20, 0.1, {"size": 0.45, "surface": "wood"}), ev_(T["R0"] + 0.3, "plush_squeak", -28, 0.0, {"pitch": 0.7, "dur": 0.15})]
ev += [ev_(T["R0"] + 0.18 + 0.05 * k + 0.12 * j, "wood_knock", -32 - 3 * j, ((k % 5) - 2) * 0.3, {"pitch": 1.7 - 0.1 * j, "dur": 0.12}) for k in range(5) for j in range(2)]   # casters
ev += [ev_(T["CANS"] + 0.07 * i + 0.25, "metal_clang", -31, 0.25, {"size": 0.18, "pitch": 2.4 + 0.04 * i}) for i in range(10)]
ev += [ev_(T["CONT"], "plush_squeak", -28, -0.1, {"pitch": 0.85, "dur": 0.15}), ev_(64.6, "keyboard_type", -33, -0.1, {"dur": 4.6, "rate": 9.5})]

cues = {
    "title": "dh011 - What if you went from chud to chad? (glow-up montage: 80s synthwave + synth brass)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.8, D],
    "stem_gain_db": {"music": -8.0, "sfx": 12.0, "amb": 9.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -15.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0}},
    "sfx_lowpass_hz": 5000,
    "shots": SCENES,
    "ambience": amb,
    "events": ev,
    "music": {"instrument": "pluck", "echo": {"delay": BEAT * 0.75, "feedback": 0.28, "mix": 0.22, "lp_hz": 2600},
              "gain_db": 0.0, "reverb_db": -8.0, "pad_db": 1.5, "pad_reverb_db": -5.0,
              "mallet_db": -4.0, "drums_db": -6.0, "brass_db": -3.0, "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
              "chords": chords, "sections": sections, "melody": [], "mallet_melody": mallet, "brass_melody": brass, "pad": pad,
              "drums": drums, "drum_patterns": drum_patterns, "stings": [],
              "ducks": [], "auto_duck": {"db": -3.0, "categories": ["prop"], "lookahead": 0.04, "hold": 0.4, "smooth": 0.2, "max_len": 1.0},
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
json.dump(cues, open(sys.argv[1], "w"), indent=1)
print(f"events {len(ev)}, chords {len(chords)}, ambience {len(amb)}, brass {len(brass)}, TIMES {len(T)}")
