# Generates cues.json for video dh010: "What if your aura doubled every day?"
# Run: python3 -I videos/dh010-aura-doubles/make_cues.py videos/dh010-aura-doubles/cues.json
#
# Sound identity: "AURA PHONK". A soft drift-phonk at 140 bpm played half-time (a slow swagger): the cowbell riff is our `bell`
# voice in 16ths over E minor (Em – C – Am – B7, one chord a bar), low-passed (no crisp highs); the 808 is a short low saw pad
# (E1+E2, cutoff 300 Hz, hp 25) on 1 and the "and" of 3 under a round kick; a soft clap on 3; felt ticks on the 8ths. One E drone
# pad under all of it (no gaps). A rising mallet "aura up" bling (E G B E) on every day jump.
# Quiet open (kitchen room tone, the toaster); the music enters on the first glow (braam + boom) and the beat DROPS on the toast
# catch. The freeze: the street's sound cuts dead (subtractive), the groove holds one chord on the pad (never silent), then a
# mallet "wah-wah-wah-wahh". −∞ = the darkest phonk drop (the riff an octave down, a heavier 808). Card: the riff once, slow.
# Voices: our formant `voice` (never an OS voice), each with a bubble on screen: "+1000 aura" (hose neighbor, 3 coworkers),
# "Hiii!" (the neighbor across the street), "minus infinity aura" (two neighbors in sync). The cat's line is a meow.
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, "shots.js")).read()
T = {k: float(v) for k, v in re.findall(r"\b([A-Z][A-Z0-9_]*): (-?\d+(?:\.\d+)?)", src[src.index("export const TIMES"):src.index("};", src.index("export const TIMES"))])}
D, END_IN = 69.0, 64.6
SCENES = [0, 6.0, 10.6, 15.4, 20.2, 25.4, 30.4, 33.0, 35.6, 40.6, 45.6, 50.8, 52.0, 52.9, 54.6, 56.4, 60.4, END_IN, D]
JUMPS = [10.6, 15.4, 20.2, 25.4, 30.4, 35.6, 40.6, 45.6]           # day jumps (cuts) after the premise
BEAT = 60 / 140; BAR = 4 * BEAT; S16 = BEAT / 4
M = T["CATCH"] - BAR                                                # bar 0 starts so the beat DROPS on the catch (bar 1)
FREEZE, THAW, HOLE = T["FREEZE"], T["THAW"], T["HOLE"]
DROP2 = HOLE                                                        # the −∞ drop
bar_t = lambda k: M + k * BAR

# ---------------------------------------------------------------- music
LOOP = ["Em", "C", "Am", "B7"]
DARK = ["Em", "Em", "C", "B7"]
ROOT = {"Em": 28, "C": 24, "Am": 33, "B7": 35}                       # E1 C1 A1 B1 (the 808 adds the octave)
RIFF = {   # 16th-step → midi (E natural/harmonic minor): the cowbell line, one bar per chord
    "Em": [(0, 76), (3, 76), (6, 79), (8, 78), (10, 76), (12, 74), (14, 71)],
    "C": [(0, 76), (3, 76), (6, 79), (8, 81), (10, 79), (12, 76), (14, 72)],
    "Am": [(0, 81), (3, 81), (6, 84), (8, 83), (10, 81), (12, 79), (14, 76)],
    "B7": [(0, 78), (3, 78), (6, 81), (8, 79), (10, 78), (12, 75), (14, 71)],
}
chords = [[0.2, "Em"]]
bars = []                                                            # (t0, chord, mode)
k = 0
while bar_t(k) < FREEZE - 0.05:
    t0 = bar_t(k); ch = LOOP[k % 4]; chords.append([round(t0, 3), ch]); bars.append((t0, ch, "main")); k += 1
chords.append([round(FREEZE, 3), "Am"])                              # time stops: one held chord
k = 0
while DROP2 + k * BAR < END_IN - 0.4:
    t0 = DROP2 + k * BAR; ch = DARK[k % 4]; chords.append([round(t0, 3), ch]); bars.append((t0, ch, "dark")); k += 1
CARD = END_IN - 0.4
chords += [[round(CARD, 3), "Em"], [round(CARD + 2 * BAR, 3), "C"]]

melody = []                                                          # the bell = the cowbell riff (instrument "bell")
for (t0, ch, mode) in bars:
    if t0 + BAR > FREEZE + 0.01 and mode == "main": break
    for (st, m) in RIFF[ch]:
        t = t0 + st * S16
        if mode == "main" and t >= FREEZE - 0.02: continue
        if mode == "dark" and t >= CARD - 0.02: continue
        v = (0.3 if st in (0, 6) else 0.22) * (1.1 if mode == "dark" else 1.0)
        melody.append([round(t, 3), m - (12 if mode == "dark" else 0), v, False, S16 * 1.6])
melody.append([round(DROP2 - 0.4, 3), 64, 0.26, False, 0.6])                  # a pickup into the −∞ drop (no gap)
# the card: the riff once more at half speed, softer
for (st, m) in RIFF["Em"] + [(16 + s, mm) for s, mm in RIFF["C"]]:
    melody.append([round(CARD + st * S16 * 2, 3), m, 0.2, False, S16 * 3])

# the "aura up" bling on every day jump + the premise + the shades; the fail "wah-wah-wah-wahh" after the freeze
mallet = []
def bling(t, v=0.2, base=88):
    return [[round(t + i * 0.07, 3), base + d, v * (1 - 0.08 * i), 0.14 if i < 3 else 0.5] for i, d in enumerate([0, 3, 7, 12])]
for t in JUMPS: mallet += bling(t + 0.05)
mallet += bling(T["GLOW_ON"] + 0.08, 0.24) + bling(T["SHADES1"], 0.2, 91) + bling(T["SUNSHADES"] + 0.05, 0.22, 91)
for i, (m, ln) in enumerate([(71, 0.32), (70, 0.32), (69, 0.32), (68, 1.6)]):
    mallet.append([round(THAW + 0.05 + i * 0.36, 3), m, 0.3, ln])

DRONE = [40, 47, 52]                                                 # E2 B2 E3
pad = [{"t0": T["GLOW_ON"] - 0.2, "t1": D - 0.2, "notes": DRONE, "level": 0.8, "attack": 0.3, "release": 0.8}]
for i in range(1, len(chords)):
    c0 = chords[i][0]; c1 = chords[i + 1][0] if i + 1 < len(chords) else D - 0.3
    if c0 < T["GLOW_ON"] - 0.3: continue
    lvl = 2.0 if FREEZE <= c0 < DROP2 else 1.1 if c0 >= CARD - 0.05 else 0.8 if c0 >= DROP2 else 0.5
    pad.append({"t0": c0, "t1": c1 + 0.3, "chord": chords[i][1], "level": lvl, "attack": 0.12, "release": 0.6, "cutoff": 1200})
# the 808: a short low saw on 1 and the "and" of 3 (under the kick), sliding nothing (house: soft)
for (t0, ch, mode) in bars:
    if t0 < T["CATCH"] - 0.05: continue
    r = ROOT[ch]
    for (st, ln, lv) in [(0, 6, 1.7), (10, 4, 1.3)]:
        t = t0 + st * S16
        if (mode == "main" and t >= FREEZE - 0.05) or (mode == "dark" and t >= CARD - 0.05): continue
        pad.append({"t0": round(t, 3), "t1": round(t + ln * S16, 3), "notes": [r, r + 12], "level": lv * (1.15 if mode == "dark" else 1.0), "attack": 0.006, "release": 0.25, "cutoff": 300, "hp": 25})
pad.append({"t0": DROP2 - 0.1, "t1": CARD, "notes": [28, 40, 47], "level": 1.0, "attack": 0.2, "release": 0.8, "cutoff": 700, "hp": 30})   # the −∞ drop: a low drone under it (no gaps)
BRAAM = [28, 35, 40, 47]
for t, lv in [(T["GLOW_ON"], 1.3), (T["OUTSHINE"], 1.4), (FREEZE, 1.1), (DROP2, 1.5), (T["MOONGULP"], 1.2), (T["SUNGULP"], 1.4)]:
    pad.append({"t0": t, "t1": t + 2.0, "notes": BRAAM, "level": lv, "attack": 0.08, "release": 0.9, "cutoff": 700, "hp": 30})

drums = [[T["GLOW_ON"] + 0.02, 0.5, "boom"], [T["CATCH"] + 0.01, 0.55, "boom"], [T["OUTSHINE"], 0.5, "boom"], [DROP2 + 0.01, 0.65, "boom"],
         [T["MOONGULP"], 0.5, "boom"], [T["SUNGULP"], 0.7, "boom"], [CARD + 0.02, 0.3, "boom"]]
KICK = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.8, 0, 0, 0, 0, 0]
CLAP = [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
TICK = [0.6, 0, 0.35, 0, 0.6, 0, 0.35, 0, 0.6, 0, 0.35, 0, 0.6, 0, 0.35, 0.25]
drum_patterns = []
SLOWMO = (15.4, 20.2)
for (a, b, v, ticks) in [(T["CATCH"], SLOWMO[0], 0.4, True), (SLOWMO[0], SLOWMO[1], 0.42, False), (SLOWMO[1], FREEZE - 0.05, 0.42, True), (DROP2, CARD - 0.05, 0.46, False)]:
    a = M + round((a - M) / BAR) * BAR if a > T["CATCH"] else a                     # keep the patterns on the bar grid
    drum_patterns += [{"t0": a, "t1": b, "step": S16, "pattern": KICK, "vel": v, "kind": "kick"},
                      {"t0": a, "t1": b, "step": S16, "pattern": CLAP, "vel": v * 0.7, "kind": "clap"}]
    if ticks: drum_patterns.append({"t0": a, "t1": b, "step": S16, "pattern": TICK, "vel": 0.16, "kind": "tick"})


# ---------------------------------------------------------------- ambience
def amb_(sound, t0, t1, g, args=None, seed=1, fi=0.05, fo=0.06):
    a = {"sound": sound, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": g, "seed": seed}
    if args: a["args"] = args
    return a

amb = [
    amb_("room_tone", 0.0, 15.42, -33, None, 1, fi=0.3), amb_("city_day", 0.0, 15.42, -56, {"murmur": 0.0, "traffic": 0.3}, 2, fi=0.3),   # kitchen
    amb_("wind", T["WIND"], 15.42, -36, {"darkness": 0.6, "gust": 0.7, "whistle": 0.0}, 3, fi=0.4),                                        # wind, indoors
    amb_("city_day", 15.4, 20.22, -46, {"murmur": 0.1, "traffic": 0.25}, 4), amb_("dry_leaves", 15.4, 20.22, -52, None, 5),                # suburb morning
    amb_("rain_window", 15.4, T["HOSE"] + 1.6, -46, None, 6),                                                                               # the hose spray
    amb_("room_tone", 20.2, 25.42, -36, None, 7), amb_("applause", T["CLAP"], 25.42, -34, {"density": 30, "swell": 0.5}, 8, fi=0.3),      # office
    amb_("traffic_flow", 25.4, 30.42, -40, None, 9), amb_("city_day", 25.4, 30.42, -44, {"murmur": 0.6, "traffic": 0.0}, 10),              # street
    amb_("crowd_cheer", 30.4, 35.62, -33, {"excite": 1.1}, 11),                                                                             # stadium
    amb_("wind", 35.6, 40.62, -38, {"darkness": 0.8, "gust": 0.4, "whistle": 0.05}, 12), amb_("city_day", 35.6, 40.62, -52, {"murmur": 0.0, "traffic": 0.5}, 13),   # roof at night
    amb_("turbines", T["JET"], 40.62, -48, {"rate": 0.5}, 14, fi=0.8),
    amb_("wind", 40.6, 50.82, -48, {"darkness": 0.95, "gust": 0.2, "whistle": 0.0}, 15, fi=0.3),                                          # space: a dark hush
    amb_("city_day", 50.8, FREEZE, -45, {"murmur": 0.3, "traffic": 0.2}, 16), amb_("dry_leaves", 50.8, FREEZE, -50, None, 17),            # the street (cut dead at the freeze)
    amb_("city_day", THAW, 60.42, -48, {"murmur": 0.0, "traffic": 0.2}, 18, fi=0.4),
    amb_("rocket_rumble", HOLE, 60.42, -40, {"rise": 0.4}, 19, fi=0.4), amb_("wind", HOLE, 60.42, -40, {"darkness": 0.7, "gust": 0.8, "whistle": 0.0}, 20, fi=0.3),
    amb_("rocket_rumble", 60.4, END_IN, -44, {"rise": 0.2}, 21, fo=0.6),
]


# ---------------------------------------------------------------- events
def ev_(t, sound, g, pan=0.0, args=None, room=None, hall=None):
    e = {"t": round(t, 3), "sound": sound, "gain_db": g, "pan": pan}
    if room is not None: e["room"] = room
    if hall is not None: e["hall"] = hall
    if args: e["args"] = args
    return e
def say(t, text, g, pitch=170, contour=None, speed=1.0, pan=0.0, room=-16, **kw):
    a = {"text": text, "pitch": pitch, "speed": speed, **kw}
    if contour: a["contour"] = contour
    return ev_(t, "voice", g, pan, a, room=room)
PLUS = "p l ah s w ah n th aa uw z ah n d ao:2 r ah"
HYPE = [[0, 1.0], [0.5, 1.12], [1, 0.95]]

ev = [
    # day 1: the toaster, the no-look miss, the bonk, the toast on the floor; the cat is not impressed
    ev_(T["TOAST1"] - 0.02, "wood_knock", -30, -0.2, {"pitch": 1.25, "dur": 0.3}),
    ev_(T["BONK"], "bonk", -21, -0.15, {"dur": 0.35}), say(T["BONK"] + 0.08, "ow:2", -27, 150, pan=-0.15),
    ev_(T["BONK"] + 0.48, "plush_place", -32, -0.1),
    ev_(5.0, "cat_meow", -32, 0.25, {"pitch": 0.8, "dur": 0.6}),
    # day 2: the glow (premise), the same toaster, the catch (the beat drops)
    ev_(T["GLOW_ON"] - 0.25, "low_swell", -26, 0.0, {"dur": 0.5, "pitch": 1.2}),
    ev_(T["TOAST2"] - 0.02, "wood_knock", -30, -0.2, {"pitch": 1.25, "dur": 0.3}),
    ev_(T["CATCH"], "plush_pickup", -27, -0.2),
    ev_(9.35, "slurp", -36, -0.2, {"dur": 0.3}),
    # day 5: napkins, the carafe floats and pours, the cat salutes ("+1000 aura" = a proud meow)
    ev_(T["LIFT"], "low_swell", -32, -0.1, {"dur": 0.6, "pitch": 1.5}),
    ev_(T["POUR0"], "slurp", -34, -0.1, {"dur": T["POUR1"] - T["POUR0"]}),
    ev_(T["SALUTE"] + 0.1, "cat_meow", -27, 0.2, {"pitch": 1.1, "dur": 0.5}),
]
for k in range(5): ev.append(ev_(T["WIND"] + 0.4 + 0.8 * k, "blanket_rustle", -34, ((k % 3) - 1) * 0.4, {"dur": 0.5, "softness": 0.6, "intensity": 0.5}))
# day 8: the sunglasses land (a tiny tink), slow-motion steps, the neighbor drops the hose: "+1000 aura"
ev += [ev_(T["SHADES1"], "metal_clang", -30, 0.0, {"size": 0.16, "pitch": 2.8}),
       ev_(T["HOSE"] + 0.05, "plush_place", -32, 0.3),
       say(T["HOSE"] + 0.25, PLUS, -19, 120, contour=HYPE, speed=0.95, pan=0.3)]
for k in range(5): ev.append(ev_(16.0 + 0.95 * k, "footstep", -30, -0.05, {"weight": 0.8, "scuff": 0.4}))
# day 11: the door, chairs roll back as the rows stand, papers, three "+1000 AURA"
ev += [ev_(T["ODOOR"], "door_open", -30, -0.2, {"creak": 0.3}),
       ev_(T["STAND"], "keyboard_type", -33, 0.0, {"dur": 1.3, "rate": 8.0}),
       say(22.9, PLUS, -19, 175, contour=HYPE, pan=0.2), say(23.5, PLUS, -19, 215, contour=HYPE, pan=-0.1), say(24.1, PLUS, -19, 140, contour=HYPE, pan=0.1)]
for k in range(6): ev.append(ev_(T["STAND"] + 0.2 + 0.3 * k, "blanket_rustle", -33, ((k % 3) - 1) * 0.3, {"dur": 0.4, "softness": 0.7, "intensity": 0.6}))
# day 14: each light turns green (a soft click), the pigeons arrive (wingbeats)
for k in range(1, 5): ev.append(ev_(T[f"LIGHT{k}"], "lamp_switch_click", -33, 0.15))
for k in range(6): ev.append(ev_(T["BIRDS"] + 0.15 * k, "blanket_rustle", -32, 0.2, {"dur": 0.25, "softness": 0.4, "intensity": 0.8}))
ev += [{"sound": "footsteps", "t0": 25.4, "t1": 30.4, "pan0": 0.0, "pan1": 0.0, "gain_db": -32.0, "rate": 1.8}]
# day 17: the wave passes (a roar swell each time a crest goes by the lens)
for t in [31.75, 34.3]: ev.append(ev_(t - 0.4, "low_swell", -28, 0.0, {"dur": 0.9, "pitch": 0.9}))
# day 21: the pillar flares, the clouds part, the jet banks past
ev += [ev_(T["CLOUDS"], "distant_boom", -28, 0.0, {"size": 0.5, "dur": 2.0}), ev_(38.6, "car_pass", -34, 0.4, {"dur": 2.2, "size": 3.0})]
# day 26/31: the Moon lights up (a swell), he outshines the Sun (boom on the music bus), the Sun's sunglasses CLONK on
ev += [ev_(T["MOONLIT"] - 0.3, "low_swell", -28, 0.0, {"dur": 1.0, "pitch": 1.3}),
       ev_(T["OUTSHINE"] - 0.4, "low_swell", -25, 0.0, {"dur": 1.2, "pitch": 0.8}),
       ev_(T["SUNSHADES"], "metal_clang", -24, 0.2, {"size": 1.4, "pitch": 0.9})]
# peak aura: the neighbor waves "Hiii!", he waves back; the mail carrier's steps; FREEZE (the street goes silent: see ambience)
ev += [say(T["NBWAVE"] + 0.1, "h aa iy:4", -19, 290, contour=[[0, 1.0], [0.4, 1.15], [1, 1.25]], pan=0.0, room=-12)]
for k in range(3): ev.append(ev_(53.0 + 0.36 * k, "footstep", -31, 0.35 - 0.1 * k, {"weight": 0.7, "scuff": 0.3}))
ev += [ev_(FREEZE, "bonk", -24, 0.0, {"dur": 0.5}),
       ev_(THAW + 0.05, "poof", -26, 0.0, {"size": 0.7, "dur": 0.6}),                                # the glow implodes
       ev_(THAW + 0.6, "metal_clang", -32, -0.1, {"size": 0.15, "pitch": 2.6}),                     # the sunglasses hit the sidewalk
       say(THAW + 0.32, "m aa iy n ah s ih n f ih n ih t iy ao:2 r ah", -20, 150, contour=[[0, 1.0], [1, 0.85]], pan=-0.25),
       say(THAW + 0.36, "m aa iy n ah s ih n f ih n ih t iy ao:2 r ah", -21, 205, contour=[[0, 1.0], [1, 0.85]], pan=0.25),
       ev_(THAW + 0.25, "crowd_noo", -29, 0.0, {"dur": 1.2, "voices": 3, "pitch": 1.1})]
# day 32: the anti-aura opens; each lawn thing goes in with a small poof
ev += [ev_(HOLE - 0.4, "low_swell", -24, 0.0, {"dur": 0.6, "pitch": 0.7}), ev_(HOLE + 0.15, "poof", -24, 0.0, {"size": 1.2, "dur": 0.9})]
for i in range(6): ev.append(ev_(HOLE + 0.4 + i * 0.42 + 1.05, "poof", -30, ((i % 3) - 1) * 0.3, {"size": 0.35, "dur": 0.4}))
ev.append(ev_(HOLE + 0.15 + 0.85, "poof", -29, -0.1, {"size": 0.3, "dur": 0.35}))                    # the sunglasses
# day 33: GULP (the Moon), GULP (the Sun)
for t, s in [(T["MOONGULP"], 1.0), (T["SUNGULP"], 1.5)]:
    ev += [ev_(t, "bonk", -20, 0.0, {"dur": 0.5}), ev_(t + 0.03, "boing", -23, 0.0, {"dur": 0.6, "pitch": 0.55}), ev_(t + 0.02, "distant_boom", -26, 0.0, {"size": s, "dur": 2.0})]
ev += [ev_(T["MOONIN"], "low_swell", -27, 0.0, {"dur": 1.0, "pitch": 1.0}), ev_(T["SUNIN"], "low_swell", -25, 0.2, {"dur": 0.9, "pitch": 0.8})]

cues = {
    "title": "dh010 - What if your aura doubled every day? (aura phonk)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.8, D],
    "stem_gain_db": {"music": -8.0, "sfx": 12.0, "amb": 9.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -15.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0}},
    "sfx_lowpass_hz": 5000,
    "shots": SCENES,
    "ambience": amb,
    "events": ev,
    "music": {"instrument": "bell", "echo": {"delay": BEAT * 0.75, "feedback": 0.2, "mix": 0.14, "lp_hz": 2400},
              "gain_db": 0.0, "reverb_db": -10.0, "pad_db": 1.5, "pad_reverb_db": -6.0,
              "mallet_db": -3.0, "drums_db": -6.0, "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
              "chords": chords, "sections": [], "melody": melody, "mallet_melody": mallet, "pad": pad,
              "drums": drums, "drum_patterns": drum_patterns, "stings": [],
              "ducks": [], "auto_duck": {"db": -2.0, "categories": ["prop"], "lookahead": 0.04, "hold": 0.4, "smooth": 0.2, "max_len": 1.0},
              "eq": [{"f": 2600, "q": 0.8, "db": -3.0}, {"f": 5500, "q": 0.6, "db": -6.0}]},
}
json.dump(cues, open(sys.argv[1], "w"), indent=1)
print(f"events {len(ev)}, chords {len(chords)}, melody {len(melody)}, pad {len(pad)}, ambience {len(amb)}, TIMES {len(T)}, M {M:.3f}")
