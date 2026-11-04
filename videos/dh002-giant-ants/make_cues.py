# Generates cues.json for video dh002 (animals lane): "What if ants were the size of dogs?"
# Run: python3 -I videos/dh002-giant-ants/make_cues.py videos/dh002-giant-ants/cues.json
#
# Sound identity: "THE ANT MARCH" — a curious mallet ostinato in E minor at 112 bpm (8ths), a soft taiko on beats 1 + 3 (the
# march of a few billion legs), a low drone pad, one rising 3-note mallet pickup per place; nature/place beds carry each scene.
#   - 0–6.2 s: a quiet kitchen (room tone, the street outside, the tiny ant's pitter-patter on the table).
#   - 6.2 (the growth): a low swell → a soft boom + a wooden creak + the mug's clink; the ostinato enters on the boom.
#   - foley on the picture: the fridge lift, the car into the hole, horns at the crosswalk, the cake, the blanket, the hill's
#     rumble, the sofa, a small dog's yip, the hot-dog cart's rattle and drop, the fridge set back down, an antenna "boop".
#   - +1 year (50.8): the march gives way to a warm, slow G-major piano arp (G – D/F# – Em – C) for the ending + end card.
import json, sys

D = 60.6
SCENES = [0, 9.2, 14.4, 19.6, 24.8, 30.0, 35.2, 40.4, 45.6, 50.8, 53.6, 56.2]
GROW = 6.2
BEAT = 60 / 112                     # 0.536 s
BAR = 4 * BEAT
WARM, FADE = 50.8, 55.6

# ---------------------------------------------------------------- music
prog = ["Em7", "Cmaj7", "Am7", "B7"]
chords = [[0.2, "Em7"]]
t, k = GROW, 0
while t < WARM - 0.01:
    chords.append([round(t, 3), prog[k % 4]]); t += BAR; k += 1
chords += [[WARM, "G"], [52.3, "D/F#"], [53.8, "Em7"], [55.3, "Cmaj7"], [56.8, "G"], [58.3, "Cmaj7"], [59.4, "G"]]

sections = [
    {"t0": GROW, "t1": WARM, "style": "ostinato", "inst": "mallet", "step": BEAT / 2, "pattern": [0, 2, 1, 4, 2, 1, 3, 1],
     "vel": [[GROW, 0.22], [19.6, 0.26], [40.4, 0.29], [WARM, 0.3]], "bass_every": 4, "bass_vel": 0.75, "len": 0.9},
    {"t0": WARM, "t1": D, "style": "arp", "vel": [[WARM, 0.3], [FADE, 0.28], [D, 0.24]], "step": 0.375, "pattern": [0, 1, 2, 3, 2, 1]},
]
SCALE = [64, 66, 67, 69, 71, 72, 74, 76, 78, 79, 81, 83, 84]   # E natural minor from E4
mallet = []
for i, s0 in enumerate(SCENES[1:9]):                    # a rising 3-note pickup opens every place
    a, b, c = SCALE[i], SCALE[i + 2], SCALE[i + 4]
    mallet += [[s0 + 0.05, a, 0.28, 0.2], [s0 + 0.19, b, 0.27, 0.2], [s0 + 0.33, c, 0.29, 0.45]]
mallet += [[55.62, 83, 0.24, 0.3], [55.74, 86, 0.22, 0.5]]                                   # the antenna tap
melody = [[53.8 + 0.05, 83, 0.22, False, 0.9], [54.9, 81, 0.21, False, 0.6], [55.4, 79, 0.24, False, 1.4],
          [56.9, 74, 0.2, False, 1.0], [57.9, 79, 0.21, False, 1.2], [58.9, 83, 0.2, False, 1.6]]
pad = [{"t0": GROW - 0.4, "t1": WARM + 0.5, "notes": [40, 47, 52], "level": 0.8, "attack": 0.5, "release": 0.8}]
for i in range(1, len(chords)):
    c0 = chords[i][0]; c1 = chords[i + 1][0] if i + 1 < len(chords) else D - 0.3
    pad.append({"t0": c0, "t1": c1 + 0.35, "chord": chords[i][1], "level": 0.5 if c0 < WARM else 1.6, "attack": 0.15, "release": 0.6})
drums = [[GROW + 0.02, 0.55, "boom"], [18.95, 0.4, "boom"], [39.05, 0.3, "boom"], [49.9, 0.35, "boom"], [53.45, 0.35, "boom"]]
drum_patterns = [{"t0": 14.4, "t1": WARM - 0.05, "step": BEAT, "pattern": [1.0, 0.0, 0.62, 0.0], "vel": [[14.4, 0.3], [40.4, 0.36], [WARM, 0.32]], "kind": "taiko"}]


# ---------------------------------------------------------------- ambience
def amb_(sound, t0, t1, g, args=None, seed=1, fi=0.05, fo=0.06):
    a = {"sound": sound, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": g, "seed": seed}
    if args: a["args"] = args
    return a

amb = [
    amb_("room_tone", 0.0, 14.45, -38, fi=0.3), amb_("city_day", 0.0, 14.45, -52, {"murmur": 0.0, "traffic": 0.35}, 1, fi=0.3),
    amb_("wind", 0.0, 14.45, -54, {"darkness": 0.7, "gust": 0.1, "whistle": 0.0}, 2, fi=0.3),
    amb_("city_day", 14.4, 19.65, -46, {"murmur": 0.0, "traffic": 0.25}, 3), amb_("wind", 14.4, 19.65, -49, {"darkness": 0.6, "gust": 0.3, "whistle": 0.0}, 4),
    amb_("city_day", 19.6, 24.85, -40, {"murmur": 0.35, "traffic": 0.7}, 5), amb_("traffic_flow", 19.6, 24.85, -50, None, 6),
    amb_("city_day", 24.8, 30.05, -47, {"murmur": 0.6, "traffic": 0.0}, 7), amb_("wind", 24.8, 30.05, -50, {"darkness": 0.6, "gust": 0.2, "whistle": 0.0}, 8),
    amb_("city_day", 30.0, 35.25, -44, {"murmur": 0.5, "traffic": 0.3}, 9), amb_("wind", 30.0, 35.25, -50, {"darkness": 0.6, "gust": 0.25, "whistle": 0.0}, 10),
    amb_("wind", 35.2, 40.45, -45, {"darkness": 0.75, "gust": 0.6, "whistle": 0.0}, 11), amb_("dry_leaves", 35.2, 40.45, -50, {"density": 0.6}, 12),
    amb_("room_tone", 40.4, 45.65, -39), amb_("city_day", 40.4, 45.65, -51, {"murmur": 0.0, "traffic": 0.4}, 13),
    amb_("city_day", 45.6, 50.85, -43, {"murmur": 0.45, "traffic": 0.45}, 14),
    amb_("room_tone", 50.8, D, -39, fo=1.0), amb_("city_day", 50.8, 56.3, -53, {"murmur": 0.0, "traffic": 0.3}, 15, fo=0.6),
]


# ---------------------------------------------------------------- events
def ev_(t, sound, g, pan=0.0, args=None, room=-16):
    e = {"t": round(t, 3), "sound": sound, "gain_db": g, "pan": pan, "room": room}
    if args: e["args"] = args
    return e

def steps(t0, t1, g, rate, p0=0.0, p1=0.0):
    return {"sound": "footsteps", "t0": t0, "t1": t1, "pan0": p0, "pan1": p1, "gain_db": g, "rate": rate}

ev = []
# 1. kitchen: the tiny ant's pitter-patter, a sniff of the sugar, the growth (swell → boom + creak + clinks), it lifts the bowl
ev += [steps(0.5, 5.3, -41, 12.0, 0.15, -0.1), ev_(GROW - 0.75, "low_swell", -25, 0.0, {"dur": 0.75, "pitch": 0.7}),
       ev_(GROW + 0.12, "giant_step", -21, 0.0, {"size": 0.7, "surface": "wood"}), ev_(GROW + 0.22, "floorboard_creak", -26, 0.0, {"dur": 0.6}),
       ev_(GROW + 0.32, "metal_clang", -31, 0.25, {"size": 0.16, "pitch": 2.6, "dur": 0.5}), ev_(GROW + 0.4, "metal_clang", -32, 0.3, {"size": 0.2, "pitch": 2.1, "dur": 0.5}),
       ev_(7.55, "metal_clang", -33, -0.2, {"size": 0.14, "pitch": 3.0, "dur": 0.4}), ev_(8.2, "plush_squeak", -31, -0.1, {"pitch": 0.75})]
# 2. the fridge: a groan as it lifts, six feet on tile, Walt's sip
ev += [ev_(9.6, "metal_groan", -29, -0.3, {"dur": 0.9, "pitch": 0.8}), ev_(10.35, "giant_step", -27, -0.3, {"size": 0.35, "surface": "wood"}),
       steps(10.6, 13.6, -32, 9.0, -0.3, -0.6), ev_(12.85, "slurp", -30, 0.25, {"dur": 0.7})]
# 3. the car: the procession's feet, the car creaking overhead, Walt running, the car into the hole
ev += [steps(14.5, 18.6, -29, 13.0, -0.4, 0.2), ev_(16.6, "metal_groan", -31, 0.0, {"dur": 1.0, "pitch": 0.7}), steps(14.8, 18.8, -31, 6.0, -0.5, 0.0),
       ev_(18.95, "giant_step", -21, 0.1, {"size": 0.8, "surface": "ground"}), ev_(19.0, "car_crash", -31, 0.1, {"weight": 0.35}),
       ev_(19.2, "blanket_rustle", -30, 0.1, {"dur": 0.6, "softness": 0.3, "intensity": 0.8})]
# 4. the crosswalk: the trail's pitter-patter both ways, two horns, the light changes (nobody moves)
ev += [steps(19.7, 24.7, -33, 18.0, -0.4, 0.4), steps(19.7, 24.7, -34, 15.0, 0.4, -0.4),
       ev_(21.0, "car_horn", -31, 0.3, {"dur": 0.4, "pitch": 1.0, "distance": 1.4}), ev_(23.5, "car_horn", -32, -0.2, {"dur": 0.8, "pitch": 0.85, "distance": 1.8})]
# 5. the wedding: ants on the lawn, the cake lifts (a boop), the table flips, the guests' murmur
ev += [steps(25.0, 29.8, -33, 9.0, -0.5, 0.2), ev_(26.3, "plush_squeak", -30, -0.2, {"pitch": 0.62}), ev_(26.45, "plush_squeak", -31, -0.2, {"pitch": 0.7}),
       ev_(27.05, "giant_step", -27, -0.15, {"size": 0.3, "surface": "wood"}), ev_(27.15, "metal_clang", -33, -0.15, {"size": 0.2, "pitch": 1.8, "dur": 0.4})]
# 6. Paris: ants arrive, the blanket lifts with everything on it, a plate clinks
ev += [steps(30.1, 31.9, -32, 12.0, -0.6, 0.0), ev_(32.1, "blanket_rustle", -27, 0.0, {"dur": 0.7, "softness": 0.4, "intensity": 0.9}),
       ev_(32.35, "metal_clang", -33, 0.1, {"size": 0.15, "pitch": 2.8, "dur": 0.4}), steps(32.8, 35.1, -32, 12.0, 0.0, 0.6)]
# 7. the hill: a long low rumble while it rises, dirt trickling, a soft boop + thud for the FOR SALE sign
ev += [ev_(35.4, "low_swell", -27, 0.0, {"dur": 3.4, "pitch": 0.55}), steps(35.3, 40.3, -34, 16.0, 0.4, -0.2),
       ev_(36.8, "blanket_rustle", -33, 0.2, {"dur": 1.2, "softness": 0.2, "intensity": 0.6}), ev_(38.4, "blanket_rustle", -33, -0.1, {"dur": 1.2, "softness": 0.2, "intensity": 0.6}),
       ev_(39.05, "giant_step", -26, -0.2, {"size": 0.3, "surface": "ground"}), ev_(39.1, "plush_squeak", -30, -0.2, {"pitch": 0.68})]
# 8. moving day: the sofa lifts, feet on the floorboards, the armchair, boxes, a happy boop for the kid
ev += [ev_(40.55, "mattress_sit", -28, 0.3), steps(41.0, 45.5, -31, 10.0, 0.4, -0.4), ev_(43.6, "mattress_sit", -29, 0.0),
       ev_(44.2, "plush_squeak", -30, 0.2, {"pitch": 0.85})]
# 9. the leash: Walt's steps, the ant's pitter, a small dog's yips, the ball, the cart rattling back + set down
ev += [steps(45.7, 48.0, -31, 3.6, -0.3, 0.0), steps(45.7, 48.3, -34, 9.0, 0.0, 0.2), ev_(46.95, "dog_bark", -30, 0.2, {"pitch": 1.35}), ev_(47.25, "dog_bark", -31, 0.2, {"pitch": 1.4}),
       steps(48.35, 48.9, -33, 16.0, 0.2, 0.7), ev_(48.85, "bonk", -34, 0.6, {"dur": 0.3}),
       ev_(48.95, "keyboard_type", -33, 0.6, {"dur": 0.7, "rate": 18.0}), ev_(49.9, "giant_step", -24, 0.0, {"size": 0.5, "surface": "ground"}),
       ev_(49.95, "metal_clang", -29, 0.0, {"size": 0.5, "pitch": 1.4, "dur": 0.8}), steps(49.45, 50.5, -31, 6.5, 0.6, 0.3)]
# 10. +1 year: the fridge comes back and is set down, Walt sips, slides the bowl, the antenna tap
ev += [steps(50.9, 52.7, -32, 9.0, -0.2, -0.5), ev_(51.4, "slurp", -31, 0.2, {"dur": 0.6}), ev_(53.1, "metal_groan", -31, -0.4, {"dur": 0.5, "pitch": 0.9}),
       ev_(53.45, "giant_step", -23, -0.4, {"size": 0.6, "surface": "wood"}), ev_(53.5, "metal_clang", -30, -0.4, {"size": 0.6, "pitch": 0.9, "dur": 0.9}),
       steps(53.7, 54.7, -33, 9.0, -0.4, -0.2), ev_(54.2, "blanket_rustle", -32, 0.0, {"dur": 0.4, "softness": 0.2, "intensity": 0.5}),
       ev_(55.6, "plush_squeak", -30, -0.1, {"pitch": 0.95})]

cues = {
    "title": "dh002 - What if ants were the size of dogs? (animals: curious mallet ant-march in E minor, place beds, warm G ending)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [59.6, D],
    "stem_gain_db": {"music": -6.0, "sfx": 12.0, "amb": 9.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -15.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0}},
    "sfx_lowpass_hz": 5000,
    "shots": SCENES + [D],
    "ambience": amb,
    "events": ev,
    "music": {"instrument": "piano", "gain_db": 0.0, "reverb_db": -10.0, "pad_db": 2.0, "pad_reverb_db": -5.0,
              "mallet_db": -1.0, "drums_db": -9.0, "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
              "chords": chords, "sections": sections, "melody": melody, "mallet_melody": mallet, "pad": pad,
              "drums": drums, "drum_patterns": drum_patterns, "stings": [{"t": GROW, "midi": 28, "vel": 0.3, "hold": 1.4}],
              "ducks": [], "auto_duck": {"db": -3.0, "categories": ["prop"], "lookahead": 0.04, "hold": 0.4, "smooth": 0.2, "max_len": 1.0},
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
json.dump(cues, open(sys.argv[1], "w"), indent=1)
print(f"events {len(ev)}, chords {len(chords)}")
