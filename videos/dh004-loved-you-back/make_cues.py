# Generates cues.json for video dh004 (funny): "What if she loved you back?"
# Run: python3 -I videos/dh004-loved-you-back/make_cues.py videos/dh004-loved-you-back/cues.json
#
# Sound identity: "UKULELE ROMCOM" — the sad-boy open has no music at all (your personal rain cloud raining on you, a dark
# room, a phone buzz), and the score ENTERS on her "yes": a plucked ukulele `bounce` in D major at 120 bpm (the romcom
# I–vi–IV–V: D Bm G A), a glockenspiel hook opening every beat, soft handclaps from the kiss cam on.
#   - SAD FM (+1 week): the groove slides into B minor and slows to a lonely plucked arp (the station's last song).
#   - the first date: a fast twinkling arp while the room fast-forwards around you.
#   - the kiss cam: kick + clap under the bounce, a stadium cheer that erupts on the kiss.
#   - the wedding: a lift to E major as the cloud comes back; four soft thuds as the groomsmen go down.
#   - +60 years: a slow warm arp in D and the hook, slowed, into the end card.
# Foley is cartoon-soft: a ceiling bonk, a sign that swings and crashes, phone buzzes per group-chat message, tear "blubs",
# a toast pop, one big library "shhh", electric chunks as the SAD FM letters die, chairs on tables, groomsman thuds.
import json, sys

D = 68.8
SCENES = [0, 5.9, 7.6, 9.0, 10.8, 13.0, 15.6, 18.2, 23.4, 25.8, 28.6, 31.0, 33.0, 33.8, 36.5, 39.0, 44.2, 46.8, 49.4, 54.6, 57.55, 60.4, 64.6]
M = 7.0                      # her "yes" — the music enters
BAR = 2.0                    # 120 bpm, one chord per bar
SAD0, SAD1 = 33.8, 39.0      # SAD FM (B minor)
DATE0, TL0, TL1 = 39.0, 39.9, 43.55
STAD = 44.2; KISS = 47.55
WED = 49.4; FAINT = [51.95, 52.2, 52.45, 52.65]
OLD = 54.6; FADE = 64.0
BONK, SIGN1, SIGN_LAND, DIVE_LAND, POP, SCREAM, SHUSH, ZERO, DDROP = 8.42, 21.33, 21.11, 27.95, 29.9, 32.15, 33.15, 35.25, 38.05
# v3 disasters (mirrors shots.js): the cloud pops, the shockwave from orbit, the bird to the face, the Friend Zone, liftoff, meteors
POPC, WAVE, HIT, FLAT, EXP, LIFT, CEIL = 7.72, 9.05, 17.05, 17.49, 19.55, 32.4, 32.77
METEORS = [40.15, 40.75, 41.3, 41.85, 42.3, 42.75, 43.1, 43.45]

# ---------------------------------------------------------------- music
chords = []
def run(t0, t1, prog, bar=BAR):
    t, k = t0, 0
    while t < t1 - 0.01:
        chords.append([round(t, 3), prog[k % len(prog)]]); t += bar; k += 1
run(M, SAD0, ["D", "Bm", "G", "A"])
run(SAD0, SAD1, ["Bm", "Em", "Bm", "F#7"], 1.3)
run(DATE0, STAD, ["D", "G", "D/F#", "A"], 1.3)
run(STAD, WED, ["D", "Bm", "G", "A"])
run(WED, OLD, ["E", "C#m", "A", "B"], 1.3)
chords += [[OLD, "D"], [56.0, "A/C#"], [57.4, "Bm"], [58.8, "G"], [60.4, "D"], [61.8, "G"], [63.0, "A"], [64.4, "D"], [66.4, "G"], [67.4, "D"]]
chords.sort()

sections = [
    {"t0": M, "t1": SAD0, "style": "bounce", "step": 0.5, "vel": [[M, 0.28], [13.0, 0.3], [25.8, 0.32], [SAD0, 0.3]], "bass_hold": 1.8, "stab_hold": 1.0},
    {"t0": SAD0, "t1": SAD1, "style": "arp", "step": 0.325, "vel": 0.26, "pattern": [0, 2, 1, 3, 2, 1]},
    {"t0": DATE0, "t1": TL0, "style": "arp", "step": 0.325, "vel": 0.26, "pattern": [0, 1, 2, 3, 2, 1]},
    {"t0": TL0, "t1": TL1, "style": "arp", "step": 0.1083, "vel": 0.22, "pattern": [0, 1, 2, 3, 2, 1, 0, 2]},
    {"t0": TL1, "t1": STAD, "style": "arp", "step": 0.325, "vel": 0.25, "pattern": [0, 2, 1, 3]},
    {"t0": STAD, "t1": WED, "style": "bounce", "step": 0.5, "vel": [[STAD, 0.3], [KISS, 0.34], [WED, 0.32]], "bass_hold": 1.8, "stab_hold": 1.0},
    {"t0": WED, "t1": OLD, "style": "bounce", "step": 0.325, "vel": 0.32, "bass_hold": 1.8, "stab_hold": 1.0},
    {"t0": OLD, "t1": FADE, "style": "arp", "step": 0.35, "vel": 0.27, "pattern": [0, 1, 2, 3, 2, 1]},
    {"t0": FADE, "t1": D, "style": "arp", "step": 0.5, "vel": 0.24, "pattern": [0, 2, 1, 3, 2, 1]},
]

# glockenspiel hook (mallet): D6 F#6 A6 F#6 E6 — opens every beat; minor for SAD FM; up a step for the wedding
HOOK = [(0.0, 86, 0.16), (0.18, 90, 0.16), (0.36, 93, 0.22), (0.62, 90, 0.16), (0.8, 88, 0.45)]
def hook(t0, shift=0, vel=0.27, minor=False, slow=1.0):
    out = []
    for dt, m, ln in HOOK:
        mm = m + shift
        if minor and (mm - shift) in (90,): mm -= 1          # F# → F (a sad, flatted third over B minor-ish colour)
        out.append([round(t0 + dt * slow, 3), mm, vel, ln * slow])
    return out
mallet = []
mallet += [[M + 0.02, 74, 0.28, 0.2], [M + 0.12, 78, 0.28, 0.2], [M + 0.22, 81, 0.3, 0.2], [M + 0.32, 86, 0.32, 0.6]]   # the "yes" sparkle
for s0 in (13.0, 18.2, 23.4, 25.8, 28.6, 31.0, STAD, 46.8):
    mallet += hook(s0 + 0.05)
mallet += [[14.55, 81, 0.24, 0.25], [14.75, 78, 0.22, 0.25], [14.95, 74, 0.22, 0.6]]           # the cloud's "aww" (box)
mallet += [[16.35, 74, 0.2, 0.2], [16.5, 78, 0.22, 0.2], [16.65, 81, 0.24, 0.2], [16.8, 86, 0.27, 0.6]]   # looking up (then the bird)
mallet += [[SCREAM + k * 0.06, 74 + [0, 2, 4, 5, 7, 9, 11, 12][k], 0.24, 0.12] for k in range(8)]          # grandma's whoop
mallet += [[SAD0 + 0.05, 83, 0.22, 0.4], [SAD0 + 0.5, 81, 0.2, 0.4], [SAD0 + 0.95, 78, 0.2, 0.4], [SAD0 + 1.4, 74, 0.2, 0.9]]   # SAD FM jingle
mallet += [[ZERO + 0.05, 71, 0.2, 0.8]]
mallet += hook(DATE0 + 0.05, 0, 0.24, slow=1.4)
mallet += hook(WED + 0.05, 2, 0.28)
mallet += [[50.6 + k * 0.07, 76 + [0, 4, 7, 12, 16][k], 0.24, 0.3] for k in range(5)]         # the cloud is back
for j0, j1 in ((54.95, 55.75), (56.3, 57.3), (57.75, 58.55)):                                     # each joke's button
    mallet += [[j1 + 0.02, 81, 0.2, 0.15], [j1 + 0.16, 86, 0.22, 0.5]]
melody = [[60.5, 78, 0.22, False, 0.8], [61.3, 81, 0.21, False, 0.6], [61.9, 83, 0.24, False, 1.2], [63.0, 81, 0.2, False, 0.9],
          [64.4, 78, 0.22, False, 1.4], [66.4, 79, 0.2, False, 1.0], [67.4, 78, 0.2, False, 1.3],
          [32.9, 74, 0.16, False, 0.5], [24.7, 78, 0.15, False, 0.45]]                                      # a soft pickup over the shush (dropout check)
pad = [{"t0": M - 0.3, "t1": D - 0.2, "notes": [38, 50, 57], "level": 0.85, "attack": 0.4, "release": 0.8}]
for i, (c0, sym) in enumerate(chords):
    c1 = chords[i + 1][0] if i + 1 < len(chords) else D - 0.3
    lvl = 0.6 if c0 < SAD0 or STAD <= c0 < OLD else 1.1 if c0 < STAD else 1.6
    pad.append({"t0": c0, "t1": c1 + 0.35, "chord": sym, "level": lvl, "attack": 0.15, "release": 0.6})
drum_patterns = [
    {"t0": STAD, "t1": WED, "step": 1.0, "pattern": [1], "vel": [[STAD, 0.4], [KISS, 0.55], [WED, 0.45]], "kind": "kick"},
    {"t0": STAD + 0.5, "t1": WED, "step": 1.0, "pattern": [1], "vel": [[STAD, 0.32], [KISS, 0.45], [WED, 0.38]], "kind": "clap"},
    {"t0": WED + 0.65, "t1": OLD, "step": 1.3, "pattern": [1], "vel": 0.32, "kind": "clap"},
]
drums = [[POPC, 0.55, "boom"], [WAVE, 0.6, "boom"], [BONK, 0.4, "boom"], [FLAT, 0.45, "boom"], [EXP, 0.65, "boom"], [DIVE_LAND, 0.45, "boom"], [CEIL, 0.55, "boom"], [DDROP, 0.65, "boom"],
         [KISS, 0.65, "boom"], [FAINT[3] + 0.42, 0.45, "boom"]]

# ---------------------------------------------------------------- ambience
def amb_(sound, t0, t1, g, args=None, seed=1, fi=0.05, fo=0.06):
    a = {"sound": sound, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": g, "seed": seed}
    if args: a["args"] = args
    return a

amb = [
    amb_("room_tone", 0.0, 13.05, -32, fi=0.3), amb_("rain_window", 0.0, 7.4, -24, {"intensity": 0.6}, 1, fi=0.4, fo=0.35),
    amb_("city_day", 0.0, 13.05, -54, {"murmur": 0.0, "traffic": 0.4}, 2, fi=0.4),
    amb_("city_day", 13.0, 18.25, -45, {"murmur": 0.1, "traffic": 0.35}, 3), amb_("wind", 13.0, 18.25, -50, {"darkness": 0.6, "gust": 0.2, "whistle": 0.0}, 4),
    amb_("city_day", 18.2, 23.45, -42, {"murmur": 0.55, "traffic": 0.6}, 6), amb_("dry_leaves", EXP + 0.3, 23.45, -34, {"density": 2.2}, 22, fi=0.4),   # the fire crackling
    amb_("room_tone", 23.4, 25.85, -40),
    amb_("room_tone", 25.8, 28.65, -40), amb_("city_day", 25.8, 28.65, -50, {"murmur": 0.6, "traffic": 0.0}, 7),
    amb_("rain_window", 26.6, 28.65, -30, {"intensity": 1.0}, 23, fi=0.6),   # the room filling with tears
    amb_("room_tone", 28.6, 31.05, -40), amb_("city_day", 28.6, 31.05, -52, {"murmur": 0.0, "traffic": 0.4}, 8),
    amb_("room_tone", 31.0, 33.85, -42), amb_("rocket_rumble", LIFT - 0.1, 33.85, -30, {"rise": 1.0}, 24, fi=0.15, fo=0.3),
    amb_("room_tone", 33.8, 36.55, -40), amb_("rain_window", 33.8, 36.55, -42, {"intensity": 0.4}, 9),
    amb_("wind", 36.5, 39.05, -45, {"darkness": 0.7, "gust": 0.4, "whistle": 0.0}, 10), amb_("city_day", 36.5, 39.05, -50, {"murmur": 0.0, "traffic": 0.5}, 11),
    amb_("room_tone", 39.0, 44.25, -40),
    amb_("city_day", 39.0, 41.0, -44, {"murmur": 0.8, "traffic": 0.0}, 12, fo=0.4), amb_("city_day", 40.6, 42.6, -50, {"murmur": 0.6, "traffic": 0.0}, 13, fi=0.3, fo=0.6),
    amb_("crowd_cheer", 44.2, KISS, -41, {"excite": 0.35}, 14, fo=0.2), amb_("crowd_cheer", KISS - 0.05, 49.45, -34, {"excite": 1.0}, 15, fi=0.15),
    amb_("applause", KISS, 49.45, -40, {"density": 30.0}, 16, fi=0.2),
    amb_("wind", 49.4, 54.65, -50, {"darkness": 0.6, "gust": 0.2, "whistle": 0.0}, 17), amb_("city_day", 49.4, 54.65, -50, {"murmur": 0.5, "traffic": 0.0}, 18),
    amb_("applause", 53.6, 54.65, -40, {"density": 24.0}, 19, fi=0.2),
    amb_("wind", 54.6, D, -50, {"darkness": 0.7, "gust": 0.15, "whistle": 0.0}, 20, fo=1.2), amb_("city_day", 54.6, 64.6, -54, {"murmur": 0.0, "traffic": 0.3}, 21, fo=0.6),
]

# ---------------------------------------------------------------- events
def ev_(t, sound, g, pan=0.0, args=None, room=-16):
    e = {"t": round(t, 3), "sound": sound, "gain_db": g, "pan": pan, "room": room}
    if args: e["args"] = args
    return e

ev = []
# 1. bedroom: a sigh, the typing buzz, her reply, the jump, the ceiling, the landing; the YES card falls off the board
ev += [ev_(2.5, "blanket_rustle", -32, 0.0, {"dur": 0.7, "softness": 0.7, "intensity": 0.5}), ev_(6.55, "phone_buzz", -27, 0.0, {"dur": 0.3}),
       ev_(7.0, "phone_buzz", -25, 0.0, {"dur": 0.45}), ev_(8.05, "blanket_rustle", -28, 0.0, {"dur": 0.4, "softness": 0.4, "intensity": 0.9}),
       ev_(POPC, "distant_boom", -19, 0.0, {"size": 0.8, "dur": 2.0}), ev_(POPC + 0.01, "plush_squeak", -25, 0.0, {"pitch": 1.2}),
       ev_(8.0, "mattress_sit", -26, 0.0), ev_(BONK, "bonk", -19, 0.0, {"dur": 0.5}), ev_(BONK + 0.02, "plush_squeak", -27, 0.0, {"pitch": 0.6}),
       ev_(8.8, "mattress_sit", -27, 0.0), ev_(8.6, "phone_set_down_wood", -32, 0.1),
       ev_(12.3, "blanket_rustle", -31, 0.2, {"dur": 0.5, "softness": 0.3, "intensity": 0.5}), ev_(12.85, "plush_place", -32, 0.2)]
# 1b. orbit: the shockwave crosses the planet
ev += [ev_(WAVE, "distant_boom", -17, 0.0, {"size": 1.8, "dur": 3.2}), ev_(WAVE - 0.4, "low_swell", -24, 0.0, {"dur": 0.5, "pitch": 0.7})]
# 2. porch: the door, steps, the birds start landing (soft thumps + a flutter), the bird to the face, you go down flat
ev += [ev_(13.05, "door_open", -30, 0.0, {"creak": 0.4}), {"sound": "footsteps", "t0": 13.4, "t1": 15.3, "pan0": 0.0, "pan1": 0.0, "gain_db": -29, "rate": 1.9}]
ev += [{"sound": "footsteps", "t0": 13.1, "t1": 18.1, "pan0": -0.5, "pan1": 0.5, "gain_db": -31, "rate": 9.0}]   # birds hitting the lawn
ev += [ev_(13.2 + k * 0.71, "blanket_rustle", -31, ((k % 3) - 1) * 0.4, {"dur": 0.25, "softness": 0.4, "intensity": 0.8}) for k in range(7)]
ev += [ev_(HIT, "bonk", -19, 0.0, {"dur": 0.5}), ev_(HIT + 0.02, "plush_squeak", -26, 0.0, {"pitch": 0.6}), ev_(FLAT, "giant_step", -23, 0.0, {"size": 0.5, "surface": "ground"})]
# 3. the Friend Zone: you walk out with a box; KABOOM ×3 behind you; the sign comes down near you; you don't look back
ev += [{"sound": "footsteps", "t0": 18.35, "t1": 23.4, "pan0": 0.3, "pan1": 0.0, "gain_db": -28, "rate": 1.9},
       ev_(EXP, "distant_boom", -17, 0.0, {"size": 1.3, "dur": 3.0}), ev_(EXP + 0.02, "car_crash", -22, -0.1, {"weight": 0.35}),
       ev_(EXP + 0.22, "distant_boom", -22, 0.25, {"size": 0.8, "dur": 2.4}), ev_(EXP + 0.45, "distant_boom", -23, -0.2, {"size": 0.7, "dur": 2.4}),
       ev_(SIGN_LAND, "metal_clang", -24, -0.3, {"size": 1.0, "pitch": 0.9}), ev_(SIGN_LAND + 0.01, "giant_step", -25, -0.3, {"size": 0.45, "surface": "ground"})]
# 4. the group chat: one buzz per message (shots.js: n = floor((t − 23.85) / 0.27) + 1)
ev += [ev_(23.85 + n * 0.27, "phone_buzz", -29, 0.0, {"dur": 0.12}) for n in range(6)]
# 5. the boys: heads snap up, the wail (tear blubs), phones fly, the hug, Mike dives on
ev += [ev_(26.25, "plush_squeak", -28, 0.0, {"pitch": 0.6}), ev_(26.5, "low_swell", -27, 0.0, {"dur": 0.7, "pitch": 0.7})]
ev += [ev_(26.55 + k * 0.22, "fish_blub", -27, ((k % 3) - 1) * 0.35, {"n_bub": 3, "dur": 0.4}) for k in range(6)]
ev += [ev_(DIVE_LAND + 0.01, "blanket_rustle", -24, 0.0, {"dur": 0.6, "softness": 0.15, "intensity": 1.0}), ev_(DIVE_LAND + 0.05, "fish_blub", -26, 0.1, {"n_bub": 4, "dur": 0.5})]
ev += [ev_(26.6, "blanket_rustle", -28, 0.0, {"dur": 0.35, "softness": 0.4, "intensity": 0.8}), ev_(27.2, "blanket_rustle", -29, 0.0, {"dur": 0.6, "softness": 0.5, "intensity": 0.6}),
       ev_(27.55, "blanket_rustle", -28, -0.2, {"dur": 0.3, "softness": 0.4, "intensity": 0.9}), ev_(DIVE_LAND, "mattress_sit", -22, 0.0), ev_(DIVE_LAND + 0.01, "giant_step", -25, 0.0, {"size": 0.4, "surface": "wood"})]
# 6. Mom: the toast pops
ev += [ev_(POP, "bonk", -27, 0.25, {"dur": 0.3}), ev_(POP + 0.03, "plush_squeak", -29, 0.25, {"pitch": 1.1})]
# 7. library: grandma's whoop (in the music), the sign falls, LIFTOFF (rocket rumble bed), she punches through the ceiling, "shhh"
ev += [ev_(SCREAM - 0.05, "low_swell", -26, 0.0, {"dur": 0.5, "pitch": 1.2}), ev_(32.6, "giant_step", -27, 0.3, {"size": 0.3, "surface": "wood"}),
       ev_(CEIL, "wood_snap", -22, 0.0, {"dur": 0.6, "size": 0.9}), ev_(CEIL + 0.01, "distant_boom", -23, 0.0, {"size": 0.6, "dur": 2.0}),
       ev_(SHUSH, "blanket_rustle", -24, 0.0, {"dur": 0.6, "softness": 0.15, "intensity": 0.8})]
# 8. SAD FM: the counter clicks to 0, the DJ's head meets the desk; the letters die one by one, the D drops and swings
ev += [ev_(ZERO, "lamp_switch_click", -28, 0.2), ev_(36.0, "bonk", -30, 0.0, {"dur": 0.35})]
for k, tl in enumerate((37.0, 37.25, 37.55, 37.8)):
    ev += [ev_(tl, "lamp_switch_click", -29, -0.3 + 0.2 * k), ev_(tl + 0.01, "metal_clang", -33, -0.3 + 0.2 * k, {"size": 0.22, "pitch": 1.8})]
ev += [ev_(DDROP, "distant_boom", -16, 0.0, {"size": 1.5, "dur": 3.0}), ev_(38.3, "distant_boom", -22, 0.15, {"size": 1.0, "dur": 2.4}),
       ev_(38.35, "metal_groan", -26, 0.0, {"dur": 0.7, "pitch": 0.8}), ev_(38.95, "metal_clang", -23, -0.2, {"size": 1.5, "pitch": 0.7})]
# 9. the date: chairs go up on the table (wood knocks), the waiter mops in fast-forward, the lights go off
ev += [ev_(41.5 + 0.35 * k + 0.25, "giant_step", -30, 0.0, {"size": 0.16, "surface": "wood"}) for k in range(2)]
ev += [{"sound": "footsteps", "t0": 41.3, "t1": 43.5, "pan0": -0.4, "pan1": 0.4, "gain_db": -33, "rate": 9.0},
       ev_(TL1 + 0.05, "lamp_switch_click", -28, 0.3)]
ev += [ev_(m + 0.55, "distant_boom", -27 + (i % 3), ((i % 3) - 1) * 0.4, {"size": 0.55, "dur": 1.8}) for i, m in enumerate(METEORS)]   # meteors landing outside the window
# 10. kiss cam: the crowd erupts (ambience), a soft smooch-ish boop, hearts
ev += [ev_(KISS, "plush_squeak", -27, 0.0, {"pitch": 0.9}), ev_(45.3, "low_swell", -28, 0.0, {"dur": 0.6, "pitch": 1.0}),
       ev_(KISS + 0.03, "distant_boom", -18, 0.0, {"size": 1.2, "dur": 2.6})]
# 11. wedding: the cloud arrives, the groomsmen cry (blubs) and go down one after another
ev += [ev_(50.2, "low_swell", -26, 0.0, {"dur": 1.0, "pitch": 1.1})]
ev += [ev_(50.0 + k * 0.22, "blanket_rustle", -30, ((k % 2) * 2 - 1) * 0.5, {"dur": 0.3, "softness": 0.4, "intensity": 0.9}) for k in range(5)]
ev += [ev_(51.0 + k * 0.33, "parrot_chirp", -30, ((k % 3) - 1) * 0.4, {"pitch": 1.1 + 0.1 * k}) for k in range(3)]
ev += [ev_(50.8 + k * 0.25, "fish_blub", -29, -0.4, {"n_bub": 3, "dur": 0.4}) for k in range(4)]
ev += [ev_(f + 0.42, "giant_step", -24, -0.35 - 0.05 * i, {"size": 0.35, "surface": "ground"}) for i, f in enumerate(FAINT)]
# 12. the bench: a soft rustle as she leans on him
ev += [ev_(61.1, "blanket_rustle", -32, 0.0, {"dur": 0.8, "softness": 0.7, "intensity": 0.4})]
ev += [ev_(b0 + 0.02, "plush_squeak", -31, -0.1, {"pitch": 0.85}) for b0 in (54.95, 56.3, 57.7)]   # each joke bubble pops
ev += [ev_(55.6, "parrot_chirp", -33, -0.5, {"pitch": 1.2}), ev_(60.9, "parrot_chirp", -33, 0.5, {"pitch": 1.05})]

cues = {
    "title": "dh004 v3 - What if she loved you back? (ridiculous: ukulele romcom over the end of the world, booms on every disaster)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [67.8, D],
    "stem_gain_db": {"music": -6.0, "sfx": 12.0, "amb": 9.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -15.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0}},
    "sfx_lowpass_hz": 5000,
    "shots": SCENES + [D],
    "ambience": amb,
    "events": ev,
    "music": {"instrument": "pluck", "echo": {"delay": 0.375, "feedback": 0.25, "mix": 0.18, "lp_hz": 2600},
              "gain_db": 0.0, "reverb_db": -10.0, "pad_db": 2.5, "pad_reverb_db": -5.0, "mallet_db": -3.0, "drums_db": -8.0,
              "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
              "chords": chords, "sections": sections, "melody": melody, "mallet_melody": mallet, "pad": pad,
              "drums": drums, "drum_patterns": drum_patterns,
              "stings": [{"t": BONK, "midi": 31, "vel": 0.26, "hold": 0.9}, {"t": SIGN_LAND, "midi": 31, "vel": 0.27, "hold": 1.1},
                         {"t": DIVE_LAND, "midi": 31, "vel": 0.24, "hold": 0.9}, {"t": ZERO, "midi": 35, "vel": 0.24, "hold": 1.2},
                         {"t": DDROP + 0.3, "midi": 35, "vel": 0.25, "hold": 1.1}, {"t": FAINT[3] + 0.42, "midi": 33, "vel": 0.24, "hold": 0.9}],
              "ducks": [], "auto_duck": {"db": -3.0, "categories": ["prop"], "lookahead": 0.04, "hold": 0.4, "smooth": 0.2, "max_len": 1.0},
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
json.dump(cues, open(sys.argv[1], "w"), indent=1)
print(f"events {len(ev)}, chords {len(chords)}, mallet notes {len(mallet)}")
