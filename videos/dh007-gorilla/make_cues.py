# Generates cues.json for video dh007: "What if 100 men actually fought 1 gorilla?"
# Run: python3 -I videos/dh007-gorilla/make_cues.py videos/dh007-gorilla/cues.json
#
# Built from the approved pitch (Dave, Steve, the banana last stand, press → mayor → support group → bench).
# Sound identity: "FIGHT NIGHT" — a mock-epic sports score in D minor at 100 bpm (BEAT 0.6 s): low spiccato strings driving in
# 8ths, soft taiko on 1 + 3, a 4-note mallet fanfare ("here we go") at the hype, at SECOND 0 and on the strike, a braam + boom on
# every knockout (the chest-beat shockwave, the jumbotron, the strike, the ring, the dogpile, the upper deck) + a soft stadium-organ
# "ta-DA" stab (two short bright pad chords, low-passed). Steve's chest beats are hollow
# toms. A stadium crowd bed roars on every big hit and hushes when Steve yawns. Quiet open: just the crowd murmur under the title;
# the score ENTERS on the hype (3.4). Then the ladder turns the score: bouncy oom-pah piano for the group chat (the joke), a
# major-key march for the mayor rally (the plan + the chat are sneaky pizzicato strings), a warm piano arp for the sunset bench. One drone pad under everything: never drops out.
# Event times mirror shots.js (the constants at the top of both files).
import json, math, sys

D = 69.6
M, BEAT = 3.4, 0.6
BAR = 4 * BEAT
S8 = BEAT / 2
# shots.js constants
BUMP, SLAP, BONK = 7.15, 12.05, 12.42
YAWN0, UP, BEAT0, WAVE, STEP = 13.6, 15.45, 15.9, 16.35, 16.95
SEC0, GRAB, LIFT, FLING, SPLAT, SLIDE = 18.4, 20.35, 21.0, 21.75, 22.75, 23.25
PICK, REL = 24.9, 25.85
HIT = REL + (9.6 - 0.45 - 1.0) / 9.5
FORM, SET_, SPIN, BLAST = 29.4, 31.3, 32.25, 32.55
DROP0, DROP1, NDROP = 36.0, 39.95, 29
JUMP0, LAUNCH = 40.75, 43.12
OFFER, TAKE, FLICK, DLAND = 45.5, 46.0, 46.55, 48.25
CONF2 = 55.8
DIVE, PLANT = 59.35, 59.75
GIVE = 61.7
CARD = 65.6
SCENES = [0, 3.4, 8.2, 13.2, 18.4, 22.3, 24.4, 29.4, 35.0, 40.6, 44.6, 47.0, 49.0, 50.9, 52.6, 56.8, 60.8, CARD]

# ---------------------------------------------------------------- music
chords = []
def bars(t0, t1, syms):
    step = (t1 - t0) / len(syms)
    for i, s in enumerate(syms):
        chords.append([round(t0 + i * step, 3), s])
bars(0.2, M, ["Dm"])
bars(M, 8.2, ["Dm", "Bb"])                                   # hype
bars(8.2, 13.2, ["Dm", "A7", "Dm", "A7"])                    # the plan (oom-pah)
bars(13.2, 18.4, ["Dm", "Bb", "Gm", "A"])                    # Steve: tension
bars(18.4, 44.6, ["Dm", "Bb", "F", "C"] * 3 + ["Dm", "Bb", "Gm", "A"] * 2 + ["Dm", "Bb", "F", "A"])   # the fight
bars(44.6, 49.0, ["Dm", "Bb", "Gm", "A"])                    # Dave's last stand
bars(49.0, 52.6, ["Dm", "A7", "Dm", "A7"])                   # +1 day: the press briefing
bars(52.6, 56.8, ["F", "C", "Bb", "C"])                      # +1 week: STEVE FOR MAYOR
bars(56.8, 60.8, ["Dm", "A7", "Dm", "A7"])                   # +1 year: the support group
bars(60.8, D, ["F", "C", "Dm", "Bb", "F", "C", "Bb", "F"])   # sunset bench + card

drive = [0, 0, 1, 0, 2, 0, 1, 0]
sections = [
    {"t0": M, "t1": 8.2, "style": "strings", "vel": [[M, 0.42], [8.2, 0.44]], "step": S8, "pattern": drive, "octave": 1, "sustain": 0.4},
    {"t0": 8.2, "t1": 13.2, "style": "strings", "vel": [[8.2, 0.36], [13.2, 0.38]], "step": S8, "pattern": [0, 2, 1, 2], "accent": [1.0, 0.6, 0.8, 0.6], "octave": 1, "len": 0.4, "sustain": 0.25},
    {"t0": 13.2, "t1": 18.4, "style": "strings", "vel": [[13.2, 0.26], [UP, 0.3], [18.4, 0.42]], "step": BEAT, "pattern": [0, 1], "accent": [1.0, 0.7], "octave": 1, "sustain": 0.45, "len": 1.0},
    {"t0": 18.4, "t1": 44.6, "style": "strings", "vel": [[18.4, 0.4], [29.4, 0.42], [40.6, 0.46], [44.6, 0.46]], "step": S8, "pattern": drive, "octave": 1, "sustain": 0.35},
    {"t0": 44.6, "t1": 49.0, "style": "strings", "vel": [[44.6, 0.3], [FLICK, 0.36], [49.0, 0.44]], "step": BEAT, "pattern": [0, 1], "accent": [1.0, 0.7], "octave": 1, "sustain": 0.5, "len": 1.0},
    {"t0": 49.0, "t1": 52.6, "style": "strings", "vel": [[49.0, 0.36], [52.6, 0.38]], "step": S8, "pattern": [0, 2, 1, 2], "accent": [1.0, 0.6, 0.8, 0.6], "octave": 1, "len": 0.4, "sustain": 0.25},
    {"t0": 52.6, "t1": 56.8, "style": "strings", "vel": [[52.6, 0.4], [56.8, 0.46]], "step": S8, "pattern": drive, "octave": 1, "sustain": 0.5},
    {"t0": 56.8, "t1": 60.8, "style": "strings", "vel": [[56.8, 0.36], [60.8, 0.38]], "step": S8, "pattern": [0, 2, 1, 2], "accent": [1.0, 0.6, 0.8, 0.6], "octave": 1, "len": 0.4, "sustain": 0.25},
    {"t0": 60.8, "t1": D, "style": "arp", "vel": [[60.8, 0.46], [CARD, 0.48], [D, 0.36]], "step": S8, "pattern": [0, 1, 2, 3, 2, 1]},
]
def fanfare(t0, notes, v=0.34):   # a short heroic mallet call, on the beat
    return [[round(t0 + k * S8, 3), m, v, 0.14 if k < len(notes) - 1 else 0.6] for k, m in enumerate(notes)]
mallet = fanfare(M + 0.02, [62, 65, 69, 74]) + fanfare(SEC0 + 0.02, [62, 65, 69, 74], 0.36) + fanfare(HIT + 0.35, [69, 74, 77, 81], 0.36) \
       + fanfare(52.62, [65, 69, 72, 77], 0.34) + fanfare(CONF2 + 0.02, [72, 77, 81, 84], 0.32) + fanfare(DLAND + 0.05, [74, 77, 81, 86], 0.32)
mallet += [[round(FLING + 0.05 + 0.08 * k, 3), 74 + 3 * k, 0.24, 0.12] for k in range(6)]                    # man #1 goes up…
mallet += [[round(SLIDE + 0.08 * k, 3), 86 - 2 * k, 0.2, 0.1] for k in range(7)]                             # …and slides down
mallet += [[round(FLICK + 0.05 + 0.1 * k, 3), 74 + 3 * k, 0.24, 0.12] for k in range(8)]                    # Dave goes up… and up
mallet += [[round(PLANT + 0.15 + 0.2 * k, 3), m, 0.22, 0.5] for k, m in enumerate([69, 65, 62])]                 # the faceplant: wah-wah-wah
melody = [[CARD + 0.1, 77, 0.22, False, 1.2], [CARD + 1.6, 72, 0.21, False, 1.2], [CARD + 3.1, 69, 0.22, False, 2.0]]

DRONE = [38, 45, 50]                                 # D2 A2 D3
pad = [{"t0": M - 0.2, "t1": D - 0.2, "notes": DRONE, "level": 0.6, "attack": 0.5, "release": 0.8}]
for i in range(len(chords)):
    c0 = chords[i][0]; c1 = chords[i + 1][0] if i + 1 < len(chords) else D - 0.3
    if c0 < M - 0.05: continue
    soft = 8.2 <= c0 < 13.2 or 49.0 <= c0 < 52.6 or 56.8 <= c0 < 60.8 or c0 >= 60.8          # the pizzicato + piano sections get a fuller pad
    pad.append({"t0": c0, "t1": c1 + 0.35, "chord": chords[i][1], "level": (2.2 if c0 >= 60.8 else 1.2) if soft else 0.5, "attack": 0.15, "release": 0.6})
BRAAM = [26, 38, 45, 50, 57]
for T in [M, WAVE, SPLAT, HIT, BLAST, LAUNCH, DLAND]:
    pad.append({"t0": T, "t1": T + 2.0, "notes": BRAAM, "level": 1.4, "attack": 0.08, "release": 0.9, "cutoff": 900, "hp": 30})
for T in [SPLAT, HIT, BLAST, LAUNCH, DLAND]:   # the stadium organ: "ta-DA" (two short bright chords, low-passed so they stay soft)
    pad.append({"t0": T + 0.25, "t1": T + 0.38, "notes": [62, 66, 69, 74], "level": 1.0, "attack": 0.01, "release": 0.12, "cutoff": 2400})
    pad.append({"t0": T + 0.45, "t1": T + 0.95, "notes": [64, 69, 73, 76], "level": 1.1, "attack": 0.01, "release": 0.35, "cutoff": 2400})
drums = [[M + 0.02, 0.6, "boom"], [WAVE + 0.02, 0.8, "boom"], [SPLAT + 0.02, 0.85, "boom"], [HIT + 0.02, 0.85, "boom"], [BLAST + 0.02, 0.9, "boom"],
         [LAUNCH + 0.02, 0.9, "boom"], [DLAND + 0.02, 0.8, "boom"], [CONF2 + 0.02, 0.6, "boom"], [PLANT + 0.02, 0.45, "boom"], [CARD + 0.02, 0.3, "boom"]]
# Steve's chest beats: alternating hands hit at sin(19 t) = ±1 (shots.js steve.chestBeat) → hollow toms
k = 0
while True:
    tk = (math.pi / 2 + k * math.pi) / 19
    k += 1
    if tk < BEAT0 + 0.05: continue
    if tk > 16.8: break
    drums.append([round(tk, 3), 0.55, "tom"])
on = lambda t: M + math.ceil((t - M) / BEAT - 1e-6) * BEAT
drum_patterns = [
    {"t0": on(M + 0.3), "t1": 8.15, "step": BEAT, "pattern": [1, 0, 0.6, 0], "vel": [[M, 0.32], [8.2, 0.38]], "kind": "taiko"},
    {"t0": on(SEC0), "t1": SPIN - 0.6, "step": BEAT, "pattern": [1, 0, 0.6, 0], "vel": [[SEC0, 0.36], [SPIN, 0.42]], "kind": "taiko"},
    {"t0": SPIN - 0.6, "t1": BLAST - 0.03, "step": 0.08, "pattern": [1], "vel": [[SPIN - 0.6, 0.12], [BLAST, 0.45]], "kind": "tom"},     # roll into the spin
    {"t0": on(BLAST + 0.6), "t1": LAUNCH - 1.0, "step": BEAT, "pattern": [1, 0, 0.6, 0], "vel": [[BLAST, 0.38], [LAUNCH, 0.42]], "kind": "taiko"},
    {"t0": LAUNCH - 1.0, "t1": LAUNCH - 0.03, "step": 0.08, "pattern": [1], "vel": [[LAUNCH - 1.0, 0.12], [LAUNCH, 0.48]], "kind": "tom"},   # the pile wobbles
    {"t0": on(52.6), "t1": 56.7, "step": BEAT, "pattern": [1, 0, 0.6, 0], "vel": [[52.6, 0.34], [56.8, 0.42]], "kind": "taiko"},
    {"t0": FLICK - 0.05, "t1": DLAND - 0.03, "step": 0.08, "pattern": [1], "vel": [[FLICK, 0.1], [DLAND, 0.42]], "kind": "tom"},     # Dave's flight
]
stings = [{"t": 60.4, "midi": 38, "vel": 0.3, "hold": 1.0}]


# ---------------------------------------------------------------- ambience (one bed per place)
def amb_(sound, t0, t1, g, args=None, seed=1, fi=0.05, fo=0.06):
    a = {"sound": sound, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": g, "seed": seed}
    if args: a["args"] = args
    return a
amb = [
    amb_("crowd_cheer", 0.0, 3.45, -40, {"excite": 0.4}, 1, fi=0.5),                 # quiet open: the stadium murmur under the title
    amb_("crowd_cheer", 3.4, 8.25, -33, {"excite": 1.0}, 2),
    amb_("applause", 3.4, 8.25, -40, {"density": 60, "swell": 0.6}, 3),
    amb_("room_tone", 8.2, 13.25, -38, None, 4),
    amb_("crowd_cheer", 13.15, 18.45, -42, {"excite": 0.3}, 5),                      # Steve yawns: the crowd hushes
    amb_("crowd_cheer", 18.4, 44.65, -34, {"excite": 1.0}, 6),
    amb_("applause", 22.7, 24.4, -36, {"density": 70, "swell": 0.9}, 7),
    amb_("applause", HIT, 29.4, -36, {"density": 70, "swell": 0.9}, 8),
    amb_("applause", BLAST, 35.0, -36, {"density": 70, "swell": 0.9}, 9),
    amb_("applause", LAUNCH, 44.6, -36, {"density": 70, "swell": 0.9}, 10),
    amb_("crowd_cheer", 44.6, 49.05, -40, {"excite": 0.5}, 11),                      # Dave's last stand: a hush…
    amb_("applause", DLAND, 49.05, -34, {"density": 80, "swell": 1.0}, 12),          # …then the upper deck catches him
    amb_("room_tone", 49.0, 52.65, -40, None, 13),
    amb_("applause", 49.0, 52.65, -44, {"density": 30, "swell": 0.3}, 14),           # the press murmurs
    amb_("crowd_cheer", 51.0, 52.65, -40, {"excite": 0.6}, 20),                      # every hand up: "Steve! Steve!"
    amb_("city_day", 52.6, 56.85, -40, {"murmur": 0.9, "traffic": 0.4}, 15),
    amb_("crowd_cheer", 52.6, 56.85, -38, {"excite": 0.9}, 16),
    amb_("room_tone", 56.8, 60.85, -38, None, 17),
    amb_("crickets", 60.8, D, -44, {"count": 3, "density": 0.5}, 18, fo=1.0),
    amb_("wind", 60.8, D, -50, {"darkness": 0.7, "gust": 0.2, "whistle": 0.0}, 19, fo=1.0),
]


# ---------------------------------------------------------------- events
def ev_(t, sound, g, pan=0.0, args=None, room=-16):
    e = {"t": round(t, 3), "sound": sound, "gain_db": g, "pan": pan, "room": room}
    if args: e["args"] = args
    return e
ev = []
# hype: stomping + the chest bump
ev += [{"sound": "footsteps", "t0": 3.5, "t1": 8.1, "pan0": -0.2, "pan1": 0.2, "gain_db": -32, "rate": 11.0}]
# the chest bump: a mid-air collision, two bodies rocket apart, two dominoes go down, Dave faceplants at the lens
ev += [ev_(BUMP, "bonk", -15, 0.0, {"dur": 0.6}), ev_(BUMP + 0.02, "boing", -20, 0.0, {"dur": 0.7, "pitch": 0.7}), ev_(BUMP + 0.03, "poof", -22, 0.0, {"size": 0.9, "dur": 0.6}),
       ev_(BUMP + 0.55, "giant_step", -22, -0.4, {"size": 0.55}), ev_(BUMP + 0.6, "giant_step", -24, -0.5, {"size": 0.5}), ev_(BUMP + 0.73, "giant_step", -24, -0.6, {"size": 0.5}),
       ev_(BUMP + 0.75, "giant_step", -20, 0.3, {"size": 0.6}), ev_(BUMP + 0.8, "plush_squeak", -26, 0.3, {"pitch": 0.6}), ev_(BUMP + 0.1, "crowd_noo", -26, 0.0, {"dur": 0.9, "voices": 8, "pitch": 1.1})]
# the plan: marker squeaks, the slap, the spin, the BONK
for k in range(4): ev.append(ev_(8.4 + k * 0.42, "pen_scribble", -27, 0.3, {"dur": 0.35}))
ev += [ev_(10.0, "pen_scribble", -27, 0.3, {"dur": 0.5}), ev_(SLAP, "wood_knock", -22, 0.1, {"pitch": 0.9}),
       ev_(SLAP + 0.15, "metal_groan", -32, 0.0, {"dur": 0.4, "pitch": 1.6}), ev_(BONK, "bonk", -15, 0.0, {"dur": 0.6}),
       ev_(BONK + 0.02, "boing", -22, 0.0, {"dur": 0.6, "pitch": 1.3}), ev_(BONK + 0.3, "bonk", -16, 0.0, {"dur": 0.5}),        # …into the ceiling
       ev_(BONK + 0.75, "giant_step", -20, 0.0, {"size": 0.6, "surface": "wood"}), ev_(BONK + 0.8, "plush_squeak", -28, 0.0, {"pitch": 1.6})]
# Steve: a long low yawn, he stands (a thud), the chest-beat shockwave
ev += [ev_(YAWN0 + 0.5, "low_swell", -24, 0.0, {"dur": 1.3, "pitch": 0.55}), ev_(UP + 0.35, "giant_step", -20, 0.0, {"size": 1.3}),
       ev_(WAVE, "poof", -18, 0.0, {"size": 1.8, "dur": 1.0}), ev_(WAVE + 0.03, "distant_boom", -22, 0.0, {"size": 0.8, "dur": 2.4})]
ev += [ev_(STEP + 0.05, "crowd_noo", -22, 0.0, {"dur": 1.0, "voices": 9, "pitch": 0.75}), ev_(STEP, "low_swell", -22, 0.0, {"dur": 0.9, "pitch": 0.7})]   # the shockwave: 100 men "WHOA"
for k in range(8): ev.append(ev_(STEP + 0.42 + 0.05 * k, "giant_step", -27 - (k % 3), (k % 5 - 2) * 0.3, {"size": 0.45}))   # the ones blown flat
# SECOND 0: the stampede, the dive, the grab
ev += [{"sound": "footsteps", "t0": SEC0, "t1": GRAB + 0.3, "pan0": 0.3, "pan1": -0.1, "gain_db": -24, "rate": 16.0}]
ev += [ev_(19.65, "boing", -24, 0.2, {"dur": 0.8, "pitch": 0.55}), ev_(GRAB, "bonk", -20, -0.2, {"dur": 0.35}), ev_(GRAB + 0.05, "plush_squeak", -26, -0.2, {"pitch": 0.8})]   # the superman dive
for k in range(6): ev.append(ev_(19.0 + 0.2 * k, "giant_step", -28, 0.4 - 0.1 * k, {"size": 0.45}))   # the trippers tumble
ev += [ev_(LIFT + 0.35, "blanket_rustle", -22, 0.0, {"dur": 0.4, "softness": 0.4, "intensity": 1.0, "strokes": 4})]   # shaken like a flag
# the leg lift, the flick, the jumbotron, the slide, the landing
ev += [ev_(LIFT + 0.45, "giant_step", -24, 0.0, {"size": 0.9}), ev_(FLING, "boing", -18, 0.0, {"dur": 0.8, "pitch": 0.6}),
       ev_(SPLAT, "car_crash", -14, 0.0, {"weight": 0.7, "dur": 1.0}), ev_(SPLAT + 0.02, "metal_clang", -20, 0.0, {"size": 1.4, "pitch": 0.8}),
       ev_(SLIDE + 0.62, "giant_step", -22, 0.0, {"size": 0.6, "surface": "wood"}), ev_(SLIDE + 0.7, "plush_squeak", -28, 0.0, {"pitch": 1.4})]
# bowling: the swing, the roll (a low rumble), the STRIKE, pins landing
ev += [ev_(PICK, "poof", -22, 0.2, {"size": 0.8, "dur": 0.5}), ev_(REL, "giant_step", -22, 0.1, {"size": 0.8}), ev_(REL + 0.4, "low_swell", -28, 0.0, {"dur": 0.6, "pitch": 0.6}),
       ev_(HIT, "wood_snap", -16, 0.0, {"size": 1.2}), ev_(HIT + 0.01, "bonk", -18, 0.0, {"dur": 0.5}), ev_(HIT + 0.04, "poof", -22, 0.0, {"size": 1.2, "dur": 0.8})]
for k in range(10): ev.append(ev_(HIT + 1.15 + 0.07 * k, "giant_step", -27 - (k % 3), (k % 5 - 2) * 0.2, {"size": 0.45}))
# the ring: they run in, the spin, the blast, everyone lands
ev += [{"sound": "footsteps", "t0": FORM, "t1": SET_, "pan0": -0.3, "pan1": 0.3, "gain_db": -26, "rate": 14.0}]
ev += [ev_(BLAST, "poof", -14, 0.0, {"size": 2.4, "dur": 1.4}), ev_(BLAST + 0.04, "crowd_noo", -22, 0.0, {"dur": 1.2, "voices": 9, "pitch": 1.1})]
for k in range(14): ev.append(ev_(BLAST + 1.45 + 0.04 * k, "giant_step", -27 - (k % 3), (k % 7 - 3) * 0.15, {"size": 0.4}))
# tire him out: jogging, one soft flop per man (29), a banana
ev += [{"sound": "footsteps", "t0": 35.05, "t1": 40.3, "pan0": -0.3, "pan1": 0.3, "gain_db": -28, "rate": 10.0}]
for k in range(NDROP):
    td = DROP0 + (DROP1 - DROP0) * k / (NDROP - 1)
    ev.append(ev_(td + 0.38, "giant_step", -29, (k % 5 - 2) * 0.2, {"size": 0.4}))
# the dogpile: eleven boings in, the pile wobbles (a groan), it launches, they rain down
for j in range(11): ev.append(ev_(JUMP0 + 0.07 * j, "boing", -27, (j % 5 - 2) * 0.2, {"dur": 0.4, "pitch": 1.1 + 0.03 * j}))
for j in range(11): ev.append(ev_(JUMP0 + 0.07 * j + 0.62, "giant_step", -26, (j % 5 - 2) * 0.2, {"size": 0.5}))
for k in range(16): ev.append(ev_(41.2 + 0.15 * k, "bonk" if k % 2 else "plush_squeak", -26 - (k % 3), (k % 5 - 2) * 0.25, {"dur": 0.3} if k % 2 else {"pitch": 0.7 + 0.1 * (k % 4)}))   # the fight cloud
ev += [{"sound": "footsteps", "t0": 41.0, "t1": LAUNCH, "pan0": -0.2, "pan1": 0.2, "gain_db": -26, "rate": 18.0}]
ev += [ev_(41.9, "metal_groan", -30, 0.0, {"dur": 1.1, "pitch": 0.7}), ev_(LAUNCH, "poof", -14, 0.0, {"size": 2.4, "dur": 1.4}),
       ev_(LAUNCH + 0.03, "distant_boom", -20, 0.0, {"size": 0.9, "dur": 2.6})]
for j in range(11):
    vy = 9.5 + 1.0; sy = 1.2
    tl = (vy + math.sqrt(vy * vy + 2 * 9.8 * (sy - 0.17))) / 9.8
    ev.append(ev_(LAUNCH + 0.02 * j + tl + 0.05 * (j % 4), "giant_step", -25, (j % 5 - 2) * 0.25, {"size": 0.55}))
# Dave's last stand: footsteps, the banana changes hands, one flick, a long flight, the upper deck catches him
ev += [{"sound": "footsteps", "t0": 44.75, "t1": OFFER, "pan0": 0.4, "pan1": 0.1, "gain_db": -28, "rate": 3.2}]
ev += [ev_(TAKE, "plush_pickup", -26, 0.1), ev_(FLICK, "bonk", -18, 0.1, {"dur": 0.4}), ev_(FLICK + 0.02, "boing", -18, 0.1, {"dur": 0.9, "pitch": 0.55}),
       ev_(FLICK + 0.1, "crowd_noo", -24, 0.0, {"dur": 1.0, "voices": 9, "pitch": 0.8}),
       ev_(DLAND, "poof", -18, -0.1, {"size": 1.6, "dur": 1.0}), ev_(DLAND + 0.03, "distant_boom", -24, -0.1, {"size": 0.7, "dur": 2.0})]
# +1 day: the press briefing (a banana, no questions)
for k in range(5): ev.append(ev_(49.3 + 0.62 * k, "plush_squeak", -32, 0.0, {"pitch": 0.75 + 0.05 * (k % 2), "dur": 0.12}))     # chewing
# +1 week: the campaign — confetti cannons
ev += [{"sound": "footsteps", "t0": 52.7, "t1": 55.5, "pan0": 0.0, "pan1": 0.0, "gain_db": -30, "rate": 5.0}]
ev += [ev_(CONF2, "poof", -18, -0.4, {"size": 1.2, "dur": 0.9}), ev_(CONF2 + 0.1, "poof", -18, 0.4, {"size": 1.2, "dur": 0.9})]
# +1 year: the support group — Dave demonstrates the leg grab one more time
ev += [ev_(DIVE, "blanket_rustle", -26, 0.0, {"dur": 0.3, "softness": 0.5, "intensity": 0.8}), ev_(PLANT, "giant_step", -18, 0.0, {"size": 0.7, "surface": "wood"}),
       ev_(PLANT + 0.02, "bonk", -22, 0.0, {"dur": 0.4}), ev_(PLANT + 0.2, "crowd_noo", -28, 0.0, {"dur": 1.0, "voices": 7, "pitch": 0.6})]
# the bench: half a banana
ev += [ev_(GIVE, "plush_pickup", -30, 0.1)]

cues = {
    "title": "dh007 - What if 100 men actually fought 1 gorilla? (fight night: D-minor strings/taiko, toms on the chest beats, organ ta-DAs, a crowd that roars)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [68.6, D],
    "stem_gain_db": {"music": -6.0, "sfx": 12.0, "amb": 9.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -15.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0}},
    "sfx_lowpass_hz": 5000,
    "shots": SCENES + [D],
    "ambience": amb,
    "events": ev,
    "music": {"instrument": "piano", "gain_db": 0.0, "reverb_db": -10.0, "pad_db": 1.0, "pad_reverb_db": -6.0, "strings_db": 3.0,
              "mallet_db": -1.0, "drums_db": -8.0, "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
              "chords": chords, "sections": sections, "melody": melody, "mallet_melody": mallet, "pad": pad,
              "drums": drums, "drum_patterns": drum_patterns, "stings": stings,
              "ducks": [], "auto_duck": {"db": -2.0, "categories": ["prop"], "lookahead": 0.04, "hold": 0.4, "smooth": 0.2, "max_len": 1.0},
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
json.dump(cues, open(sys.argv[1], "w"), indent=1)
print(f"events {len(ev)}, chords {len(chords)}, ambience {len(amb)}")
