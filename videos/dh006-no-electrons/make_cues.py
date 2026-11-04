# Generates cues.json for video dh006 v2: "What if electrons disappeared for five seconds?"
# Run: python3 -I videos/dh006-no-electrons/make_cues.py videos/dh006-no-electrons/cues.json
#
# Sound identity: "SCIENCE FAIR → SPACE OPERA", POV edition. Quiet open = the street itself (lunch-rush murmur, traffic, footsteps,
# a car going by) while the HUD counts down 3 s. At SECOND 0 (6.5) the whole street sound CUTS dead (time froze: subtractive) and the
# score enters: a mallet sparkle + a soft boom + a puff, then a curious synth-pluck 16th arpeggio with echo in A minor (Am F C G,
# 120 bpm, beat 0 = SECOND 0) over a drone pad, a rising 4-note mallet "hmm?" hook opening every shot, a glass gliss when the
# street turns x-ray, a pop cascade when the people fizz.
# From the blast ("Everyone here has 100%", 29.95): absurdly epic — low spiccato strings drive (Am F Dm E), soft taiko on 1 + 3,
# a braam + boom + big poof on every blast (the people, the street lifting off, Earth, the Moon), a tom roll as the energy bar
# shoots past the supernova. The electrons' return = the bare plucks again (tiptoe), then the blue blast, then a warm pad + slow
# arp under the card. Music never drops out (one drone pad under everything).
import json, sys

D = 67.5
M, BEAT, BAR = 6.5, 0.5, 2.0                         # mirrors shots.js: SECOND 0 = beat 0
T_SKY, T_GHOST, T_FIZZ, T_BLAST, T_RISE = 8.6, 16.85, 20.5, 29.95, 32.35
T_EARTH, T_BAR, T_WALL, T_BACK, T_EBOOM = 38.8, 45.95, 50.9, 54.95, 60.85
T_SLIP = 5.45                                        # v3: the banana peel
SN_PASS = T_BAR + 0.815                              # the bar's top passes 1 SUPERNOVA (0.6·e^(3.1 b) = 7.5 in shots.js)
SCENES = [0, 14.0, 20.0, 26.0, 32.0, 38.0, 43.4, 49.1, 54.4, 60.8, 63.0]
CARD = 63.0
beat_t = lambda n: M + n * BEAT
on_beat = lambda t: beat_t(-(-round((t - M) / BEAT * 1000) // 1000))

# ---------------------------------------------------------------- music
chords = [[0.2, "Am"]]
def run(t0, t1, prog, bar=BAR):
    t, k = t0, 0
    while t < t1 - 0.01:
        chords.append([round(t, 3), prog[k % len(prog)]]); t += bar; k += 1
BUILD0, TIP0, BLAST0, END0 = M + 11 * BAR, M + 24 * BAR, M + 26 * BAR, M + 27 * BAR   # 28.5, 54.5, 58.5, 60.5
run(M, BUILD0, ["Am", "F", "C", "G"])                        # curious
run(BUILD0, TIP0, ["Am", "F", "Dm", "E"])                    # the build → epic
run(TIP0, BLAST0, ["Am", "Dm", "E7", "Am"], 1.0)             # tiptoe
run(BLAST0, END0, ["Am"])
chords += [[END0, "F"], [END0 + 1.0, "E"], [END0 + 2.0, "Am"], [END0 + 4.5, "F"], [END0 + 6.0, "Am"]]

drive = [0, 0, 1, 0, 2, 0, 1, 0]
sections = [
    {"t0": M, "t1": TIP0, "style": "arp", "vel": [[M, 0.3], [T_BLAST, 0.3], [T_BLAST + 0.5, 0.24], [TIP0, 0.24]], "step": 0.125, "pattern": [0, 1, 2, 3, 2, 1, 2, 3]},
    {"t0": T_BLAST, "t1": TIP0, "style": "strings", "vel": [[T_BLAST, 0.44], [T_EARTH, 0.4], [T_WALL, 0.46], [TIP0, 0.42]], "step": 0.25, "pattern": drive, "octave": 1, "sustain": 0.35},
    {"t0": TIP0, "t1": BLAST0, "style": "arp", "vel": [[TIP0, 0.26], [BLAST0, 0.28]], "step": 0.25, "pattern": [0, 2, 1, 3]},
    {"t0": BLAST0, "t1": END0, "style": "strings", "vel": 0.4, "step": 0.25, "pattern": [0, 1, 2, 1], "octave": 1, "sustain": 0.5},
    {"t0": END0, "t1": D, "style": "arp", "vel": [[END0, 0.26], [CARD, 0.3], [D, 0.24]], "step": 0.375, "pattern": [0, 1, 2, 3, 2, 1]},
]
mallet = [[M + 0.02, 81, 0.3, 0.12], [M + 0.14, 84, 0.3, 0.12], [M + 0.26, 88, 0.32, 0.5]]                  # the electrons leave
for s0 in [14.0, 20.0, 26.0]:                                                                                   # curious "hmm?" hook
    t = on_beat(s0 + 0.02); mallet += [[t, 76, 0.28, 0.12], [t + 0.25, 81, 0.27, 0.12], [t + 0.5, 83, 0.28, 0.12], [t + 0.75, 84, 0.3, 0.4]]
for s0 in [32.0, 38.0, 43.4, 49.1]:                                                                             # the same hook, epic
    t = on_beat(s0 + 0.02); mallet += [[t, 69, 0.3, 0.14], [t + 0.25, 72, 0.3, 0.14], [t + 0.5, 76, 0.32, 0.14], [t + 0.75, 81, 0.34, 0.5]]
mallet += [[T_GHOST + 0.08 * k, n, 0.24, 0.2] for k, n in enumerate([72, 76, 79, 84, 88])]                     # the street goes glass
mallet += [[T_GHOST + 2.0 + 0.1 * k, n, 0.22, 0.3] for k, n in enumerate([84, 88, 91])]                        # …your hands too
mallet += [[T_BAR + 0.07 * k, n, 0.24, 0.12] for k, n in enumerate([69, 71, 72, 74, 76, 77, 79, 81, 83, 84])]  # the bar climbs
melody = [[CARD + 0.1, 76, 0.22, False, 1.2], [CARD + 1.6, 72, 0.21, False, 1.2], [CARD + 3.1, 69, 0.22, False, 2.2]]

DRONE = [45, 52, 57]                                 # A2 E3 A3
pad = [{"t0": M - 0.3, "t1": D - 0.2, "notes": DRONE, "level": 0.85, "attack": 0.4, "release": 0.8}]
for i in range(1, len(chords)):
    c0 = chords[i][0]; c1 = chords[i + 1][0] if i + 1 < len(chords) else D - 0.3
    if c0 < M: continue
    pad.append({"t0": c0, "t1": c1 + 0.35, "chord": chords[i][1], "level": 0.55 if c0 < END0 else 1.5, "attack": 0.15, "release": 0.6})
BRAAM = [33, 40, 45, 52, 57]
for T in [T_BLAST, T_RISE, T_EARTH, T_WALL, T_EBOOM]:
    pad.append({"t0": T, "t1": T + 2.2, "notes": BRAAM, "level": 1.5, "attack": 0.1, "release": 0.9, "cutoff": 900, "hp": 30})
drums = [[M + 0.02, 0.5, "boom"], [T_SKY + 0.02, 0.3, "boom"], [T_FIZZ + 0.02, 0.35, "boom"], [T_BLAST + 0.02, 0.85, "boom"],
         [T_RISE + 0.02, 0.8, "boom"], [T_EARTH + 0.02, 0.9, "boom"], [SN_PASS, 0.75, "boom"], [T_WALL + 0.02, 0.9, "boom"],
         [T_EBOOM + 0.02, 0.9, "boom"], [CARD + 0.02, 0.3, "boom"]]
drum_patterns = [
    {"t0": on_beat(T_BLAST + 0.4), "t1": TIP0 - 0.05, "step": BEAT, "pattern": [1, 0, 0.6, 0], "vel": [[T_BLAST, 0.3], [T_EARTH, 0.34], [TIP0, 0.4]], "kind": "taiko"},
    {"t0": T_BAR + 0.05, "t1": SN_PASS - 0.04, "step": 0.08, "pattern": [1], "vel": [[T_BAR, 0.12], [SN_PASS, 0.45]], "kind": "tom"},
]
stings = []


# ---------------------------------------------------------------- ambience
def amb_(sound, t0, t1, g, args=None, seed=1, fi=0.05, fo=0.06):
    a = {"sound": sound, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": g, "seed": seed}
    if args: a["args"] = args
    return a

amb = [
    amb_("city_day", 0.0, M + 0.02, -36, {"murmur": 0.85, "traffic": 0.75}, 1, fi=0.4, fo=0.03),          # the lunch rush… cut dead at SECOND 0
    amb_("traffic_flow", 0.0, M + 0.02, -44, None, 2, fi=0.4, fo=0.03),
    amb_("wind", M + 0.3, T_RISE, -52, {"darkness": 0.9, "gust": 0.1, "whistle": 0.0}, 3, fi=1.2, fo=0.3),   # frozen time: almost nothing
    amb_("rocket_rumble", T_RISE, 38.05, -44, {"rise": 0.8}, 4, fi=0.15),
    amb_("rocket_rumble", T_EARTH, 43.45, -50, {"rise": 0.4}, 5, fi=0.3),
    amb_("rocket_rumble", T_WALL - 1.2, 54.45, -47, {"rise": 1.0}, 6, fi=0.8),
]


# ---------------------------------------------------------------- events
def ev_(t, sound, g, pan=0.0, args=None, room=-16):
    e = {"t": round(t, 3), "sound": sound, "gain_db": g, "pan": pan, "room": room}
    if args: e["args"] = args
    return e

ev = [{"sound": "footsteps", "t0": 0.3, "t1": M, "pan0": -0.2, "pan1": 0.2, "gain_db": -36, "rate": 7.0},
      ev_(2.6, "car_pass", -33, 0.5), ev_(5.1, "car_pass", -35, -0.4)]
# SECOND 0: a puff of everything leaving; a breath later the sky drains to black
ev += [ev_(M, "poof", -18, 0.0, {"size": 1.3, "dur": 0.9}), ev_(M + 1.2, "low_swell", -30, 0.0, {"dur": 1.0, "pitch": 1.3}),
       ev_(T_SKY, "low_swell", -27, 0.0, {"dur": 0.6, "pitch": 0.8})]
# your hands: a sleeve rustle as you look down; the glass sweep
ev += [ev_(14.35, "blanket_rustle", -33, 0.0, {"dur": 0.5, "softness": 0.6, "intensity": 0.5}), ev_(T_GHOST + 0.45, "low_swell", -29, 0.0, {"dur": 0.9, "pitch": 1.4})]
# +1 fs: the people fizz (a puff + a cascade of tiny pops)
ev += [ev_(T_FIZZ, "poof", -20, 0.0, {"size": 1.1, "dur": 0.8})]
for k in range(18): ev.append(ev_(T_FIZZ + 0.03 + k * 0.035, "plush_squeak", -33 + (k % 3), (k % 5 - 2) * 0.25, {"pitch": 1.0 + 0.04 * (k % 9), "dur": 0.1}))
# the blasts: the people, the street lifting off, Earth, the Moon
for T, size in [(T_BLAST, 2.2), (T_RISE, 2.4), (T_EARTH, 2.6), (T_WALL, 2.6)]:
    ev += [ev_(T, "poof", -14, 0.0, {"size": size, "dur": 1.5}), ev_(T + 0.03, "distant_boom", -20, 0.0, {"size": 0.9, "dur": 3.0})]
ev += [ev_(T_WALL, "low_swell", -24, 0.0, {"dur": 1.8, "pitch": 0.7}), ev_(T_RISE + 0.7, "low_swell", -28, 0.0, {"dur": 1.4, "pitch": 1.2}),
       ev_(SN_PASS + 2.2, "low_swell", -27, 0.0, {"dur": 2.2, "pitch": 1.5})]
# v3: cartoon foley for the gags
ev += [ev_(T_SLIP + 0.1, "boing", -21, 0.1, {"dur": 0.6, "pitch": 1.5}), ev_(T_SLIP + 0.05, "plush_squeak", -28, 0.1, {"pitch": 0.7}),
       ev_(5.75, "dog_bark", -30, -0.3, {"pitch": 1.1})]
for k in range(3): ev.append(ev_(M + 0.03 + k * 0.14, "plush_squeak", -27, (k - 1) * 0.4, {"pitch": 1.3 + 0.15 * k}))   # three electrons pop out
ev += [ev_(M + 0.5, "plush_squeak", -27, -0.2, {"pitch": 1.05}), ev_(M + 1.6, "plush_squeak", -30, 0.0, {"pitch": 1.9, "dur": 0.12}),
       ev_(20.35, "plush_squeak", -25, 0.0, {"pitch": 0.58}),                          # the hot dog that didn't fizz: squeak
       ev_(30.55, "boing", -26, 0.3, {"dur": 0.4, "pitch": 2.0}),                       # …and spins past the lens
       ev_(T_EARTH + 0.05, "bonk", -22, 0.0, {"dur": 0.45}),                            # POP!
       ev_(44.75, "bonk", -26, 0.2, {"dur": 0.35})]                                      # lands on the bar
for k, t in enumerate([50.5, 51.4, 52.3]): ev.append(ev_(t, "bonk", -27 - 3 * k, -0.1, {"dur": 0.3}))   # low-gravity bounces on the Moon
for k in range(3): ev.append(ev_(T_BACK + 0.35 + k * 0.25, "plush_squeak", -27, (k - 1) * 0.4, {"pitch": 1.2 + 0.15 * k}))
ev += [ev_(57.22, "plush_squeak", -27, 0.35, {"pitch": 0.95}), ev_(58.95, "plush_squeak", -26, 0.0, {"pitch": 0.58}),
       ev_(59.9, "crowd_noo", -19, 0.0, {"dur": 1.1, "voices": 3, "pitch": 1.8}),
       ev_(59.92, "voice", -18, 0.0, {"text": "n uw:9", "pitch": 330, "contour": [[0, 1.15], [0.5, 1.0], [1, 0.7]], "shout": 0.8}, room=-20),
       ev_(62.05, "plush_squeak", -28, 0.0, {"pitch": 0.6})]                            # the hot dog, alone in the universe
# the electrons come back (a shimmer as the ball forms), then explode too
ev += [ev_(T_BACK + 1.0, "low_swell", -28, 0.0, {"dur": 1.0, "pitch": 1.6}),
       ev_(T_EBOOM, "poof", -13, 0.0, {"size": 2.8, "dur": 1.6}), ev_(T_EBOOM + 0.03, "distant_boom", -19, 0.0, {"size": 1.0, "dur": 3.0})]

cues = {
    "title": "dh006 v2 - What if electrons disappeared for five seconds? (POV: the street cuts dead at second 0; pluck arp → strings/taiko/braams)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [66.3, D],
    "stem_gain_db": {"music": -6.0, "sfx": 12.0, "amb": 9.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -15.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0}},
    "sfx_lowpass_hz": 5000,
    "shots": SCENES + [D],
    "ambience": amb,
    "events": ev,
    "music": {"instrument": "pluck", "echo": {"delay": 0.375, "feedback": 0.35, "mix": 0.28, "lp_hz": 3000},
              "gain_db": 0.0, "reverb_db": -9.0, "pad_db": 2.0, "pad_reverb_db": -5.0, "strings_db": 6.0,
              "mallet_db": -1.0, "drums_db": -8.0, "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
              "chords": chords, "sections": sections, "melody": melody, "mallet_melody": mallet, "pad": pad,
              "drums": drums, "drum_patterns": drum_patterns, "stings": stings,
              "ducks": [], "auto_duck": {"db": -3.0, "categories": ["prop"], "lookahead": 0.04, "hold": 0.4, "smooth": 0.2, "max_len": 1.0},
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
json.dump(cues, open(sys.argv[1], "w"), indent=1)
print(f"events {len(ev)}, chords {len(chords)}, ambience {len(amb)}")
