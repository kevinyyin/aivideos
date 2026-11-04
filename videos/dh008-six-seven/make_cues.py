# Generates cues.json for video dh008: "What if every "6-7" got twice as loud?"
# Run: python3 -I videos/dh008-six-seven/make_cues.py videos/dh008-six-seven/cues.json
#
# Sound identity: "PLAYGROUND TRAP". The voice is the star: every "6-7" is our own formant voice (audio/synth.py `voice`, never an
# OS voice) and each one is BIGGER — Leo's whisper (`whisper` 1) → one kid → a desk row → the whole class → the playground →
# a dad (deadpan) → a stadium chant → a sidewalk crowd → the scientist → a parrot → the whole planet. Bigger = more voices, a
# longer reverb send, a sub boom, never a hotter master (≈ −15 LUFS, low-passed, no clipping).
# Quiet open (room tone + chalk); the score enters on the whisper (beat 0 = 6.0 s, 120 bpm): a G-minor bell arpeggio in 16ths
# with echo over a G drone (Gm – Gm/F – Eb – D7, one chord a bar), a 3-note mallet "six-sev-en" jingle answering the early
# repeats, a soft half-time kick + clap from the desk row on, a low string drive + taiko from the stadium, braams + booms on the
# big ones, a tom roll into 194 dB. +1 day: the groove thins to the pad and a bare arp (never silent), then "…SEVEN." slams it
# all back; the Moon blows up, then the Sun (the biggest braam + boom of the reel); the card turns to G major with the jingle.
import json, sys

D, END_IN = 70.0, 66.0
SAY = {1: 6.0, 2: 9.5, 3: 11.5, 4: 14.0, 5: 16.0, 6: 19.5, 7: 21.5, 8: 25.5, 9: 30.0, 10: 31.5, 11: 33.0, 12: 36.5, 13: 38.0, 14: 39.5,
       15: 44.0, 16: 47.5, 17: 52.5, 18: 54.5, 19: 61.0}                       # mirrors shots.js SAY
SILENCE, SIX, FREEZE, MOON_HIT, SUN_HIT = 57.0, 58.75, 59.75, 62.95, 64.75
CHALK0, CHALK1, TRACE0, TRACE1 = 3.45, 4.7, 41.35, 43.3
SHORT = SAY[11] + 1.3                                                         # the LED wall shorts out
WAVE0, WAVE_V = SAY[14] + 0.05, 40.0                                          # shop windows: front from x = −30 toward the lens
BIRD_OUT, FLOCK_OUT = SAY[16] + 0.15, SAY[16] + 0.45
SCENES = [0, 5.4, 8.8, 13.2, 18.6, 21.4, 24.2, 26.8, 29.4, 32.8, 35.8, 38.6, 41.2, 43.8, 46.6, 49.0, 51.6, 57.0, 60.6, 62.4, 64.0, D]
M, BEAT, BAR = SAY[1], 0.5, 2.0
beat_t = lambda n: M + n * BEAT
on_beat = lambda t: beat_t(-(-round((t - M) / BEAT * 1000) // 1000))

# ---------------------------------------------------------------- music
chords = [[0.2, "Gm"]]
def run(t0, t1, prog, bar=BAR):
    t, k = t0, 0
    while t < t1 - 0.01:
        chords.append([round(t, 3), prog[k % len(prog)]]); t += bar; k += 1
LOOP = ["Gm", "Gm/F", "Eb", "D7"]
CARD = END_IN
run(M, SILENCE, LOOP)
run(SILENCE, SAY[19], ["Gm", "Eb"], 2.0)
run(SAY[19], CARD - 0.4, LOOP)
run(CARD - 0.4, D, ["G", "Em", "C", "D"])                                    # the card: G major (warm, a little smug)

sections = [
    {"t0": M, "t1": SILENCE, "style": "arp", "vel": [[M, 0.2], [SAY[4], 0.26], [SAY[9], 0.3], [SAY[14], 0.33], [SILENCE, 0.33]], "step": 0.125, "pattern": [0, 1, 2, 3, 2, 1, 2, 3]},
    {"t0": SAY[9] - 0.05, "t1": SILENCE, "style": "strings", "vel": [[SAY[9], 0.34], [SAY[14], 0.44], [41.2, 0.36], [46.6, 0.38], [51.6, 0.46], [SILENCE, 0.46]], "step": 0.25, "pattern": [0, 0, 1, 0, 2, 0, 1, 0], "octave": 1, "sustain": 0.35},
    {"t0": SILENCE, "t1": SAY[19] - 0.05, "style": "arp", "vel": 0.17, "step": 0.25, "pattern": [0, 2, 1, 3]},
    {"t0": SAY[19] - 0.05, "t1": CARD - 0.4, "style": "arp", "vel": 0.34, "step": 0.125, "pattern": [0, 1, 2, 3, 2, 1, 2, 3]},
    {"t0": SAY[19] - 0.05, "t1": CARD - 0.4, "style": "strings", "vel": 0.46, "step": 0.25, "pattern": [0, 0, 1, 0, 2, 0, 1, 0], "octave": 1, "sustain": 0.4},
    {"t0": CARD - 0.4, "t1": D, "style": "arp", "vel": [[CARD - 0.4, 0.26], [D, 0.2]], "step": 0.375, "pattern": [0, 1, 2, 3, 2, 1]},
]
# the jingle "six-sev-en" (D5 · A4 A4) answers a repeat; it climbs a semitone each time (louder → higher), then stays big
mallet = []
for k, n in enumerate([1, 2, 3, 4, 5, 6, 7, 8, 12, 15, 16]):
    t = SAY[n] + 0.75; up = min(k, 6); v = min(0.36, 0.22 + 0.015 * k)
    mallet += [[t, 74 + up, v, 0.14], [t + 0.25, 69 + up, v * 0.92, 0.12], [t + 0.375, 69 + up, v * 0.95, 0.3]]
mallet += [[CARD + 0.35, 74, 0.26, 0.16], [CARD + 0.6, 71, 0.24, 0.12], [CARD + 0.725, 71, 0.25, 0.5]]          # the card, in G major
# the windows: a soft glass sparkle down the street (a falling run of high mallet notes, on the wave)
for k in range(10): mallet.append([round(WAVE0 + 0.1 * k, 3), [96, 93, 91, 89, 88, 86, 84, 86, 84, 81][k], 0.13, 0.35])
melody = []

DRONE = [43, 50, 55]                                  # G2 D3 G3
pad = [{"t0": M - 0.3, "t1": D - 0.2, "notes": DRONE, "level": 0.85, "attack": 0.4, "release": 0.8}]
for i in range(1, len(chords)):
    c0 = chords[i][0]; c1 = chords[i + 1][0] if i + 1 < len(chords) else D - 0.3
    if c0 < M: continue
    pad.append({"t0": c0, "t1": c1 + 0.35, "chord": chords[i][1], "level": 1.1 if SILENCE <= c0 < SAY[19] - 0.1 else 1.4 if c0 >= CARD - 0.5 else 0.55, "attack": 0.15, "release": 0.6})
BRAAM = [31, 38, 43, 50, 55]
for T in [SAY[11], SAY[14], SAY[15], SAY[17], SAY[18], SAY[19], MOON_HIT, SUN_HIT]:
    pad.append({"t0": T, "t1": T + 2.2, "notes": BRAAM, "level": 1.5, "attack": 0.1, "release": 0.9, "cutoff": 900, "hp": 30})

drums = [[M + 0.02, 0.2, "boom"]]
for n, v in [(3, 0.2), (5, 0.4), (7, 0.45), (8, 0.35), (11, 0.8), (14, 0.85), (15, 0.85), (16, 0.6), (17, 0.85), (18, 0.95), (19, 1.0)]:
    drums.append([SAY[n] + 0.02, v, "boom"])
drums += [[SHORT + 0.02, 0.6, "boom"], [MOON_HIT + 0.02, 0.9, "boom"], [SUN_HIT + 0.02, 1.0, "boom"], [CARD + 0.02, 0.3, "boom"]]
KICK, CLAP = [1, 0, 0, 0.7, 0, 0, 0, 0], [0, 0, 0, 0, 1, 0, 0, 0]         # half-time: kick on 1 + the "a" of 2, clap on 3
drum_patterns = []
for t0, t1, v in [(beat_t(16), 41.2, 0.42), (on_beat(46.6), SILENCE - 0.05, 0.46), (on_beat(SAY[19] + 0.4), CARD - 0.45, 0.48)]:
    drum_patterns += [{"t0": t0, "t1": t1, "step": 0.25, "pattern": KICK, "vel": v, "kind": "kick"},
                      {"t0": t0, "t1": t1, "step": 0.25, "pattern": CLAP, "vel": v * 0.8, "kind": "clap"}]
drum_patterns += [{"t0": on_beat(SAY[9]), "t1": 41.15, "step": BEAT, "pattern": [1, 0, 0.6, 0], "vel": [[SAY[9], 0.26], [SAY[14], 0.36], [41.0, 0.3]], "kind": "taiko"},
                  {"t0": on_beat(51.6), "t1": SILENCE - 0.05, "step": BEAT, "pattern": [1, 0, 0.6, 0], "vel": [[51.6, 0.3], [SILENCE, 0.42]], "kind": "taiko"},
                  {"t0": 53.65, "t1": SAY[18] - 0.04, "step": 0.08, "pattern": [1], "vel": [[53.65, 0.12], [SAY[18], 0.45]], "kind": "tom"}]
stings = []


# ---------------------------------------------------------------- ambience
def amb_(sound, t0, t1, g, args=None, seed=1, fi=0.05, fo=0.06):
    a = {"sound": sound, "t0": t0, "t1": t1, "fade_in": fi, "fade_out": fo, "gain_db": g, "seed": seed}
    if args: a["args"] = args
    return a

amb = [
    amb_("room_tone", 0.0, 18.62, -34, None, 1, fi=0.3),                                                    # Room 4
    amb_("crowd_cheer", 18.6, 24.22, -46, {"excite": 0.5}, 2), amb_("city_day", 18.6, 24.22, -44, {"murmur": 0.6, "traffic": 0.2}, 3),   # recess
    amb_("city_day", 24.2, 29.42, -44, {"murmur": 0.05, "traffic": 0.3}, 4), amb_("dry_leaves", 24.2, 29.42, -52, None, 5),          # suburb
    amb_("crowd_cheer", 29.4, 35.82, -32, {"excite": 1.0}, 6),                                              # stadium
    amb_("city_day", 35.8, 41.22, -38, {"murmur": 0.7, "traffic": 0.6}, 7), amb_("traffic_flow", 35.8, 41.22, -46, None, 8),          # downtown
    amb_("room_tone", 41.2, 46.62, -38, None, 9),                                                           # Station 7
    amb_("city_day", 46.6, 51.62, -44, {"murmur": 0.05, "traffic": 0.3}, 10), amb_("dry_leaves", 46.6, 51.62, -52, None, 11),
    amb_("rocket_rumble", SAY[18], SILENCE + 0.02, -48, {"rise": 0.6}, 12, fi=0.2),                         # the shockwave rumble
    amb_("room_tone", SILENCE, 62.42, -38, None, 13),                                                       # +1 day: Room 4, silent
]


# ---------------------------------------------------------------- events
def ev_(t, sound, g, pan=0.0, args=None, room=None, hall=None):
    e = {"t": round(t, 3), "sound": sound, "gain_db": g, "pan": pan}
    if room is not None: e["room"] = room
    if hall is not None: e["hall"] = hall
    if args: e["args"] = args
    return e

SIXSEVEN = "s ih:1.2 k s _:0.6 s eh:1.3 v ah n"
FALL = [[0, 1.12], [0.42, 1.1], [0.5, 0.98], [1, 0.82]]                        # "SIX" up, "sev-en" down
def line(t, pitch, g, pan=0.0, text=SIXSEVEN, contour=FALL, room=None, hall=None, **kw):
    return ev_(t, "voice", g, pan, {"text": text, "pitch": pitch, "contour": contour, **kw}, room=room, hall=hall)
def chorus(t, n, lo, hi, g, spread=0.09, room=None, hall=None, text=SIXSEVEN, **kw):
    out = []
    for k in range(n):
        u = (k * 0.618) % 1.0
        out.append(line(t + ((k * 37) % 7 - 3) * spread / 6, lo + (hi - lo) * u, g, ((k % 7) - 3) * 0.16, text=text, room=room, hall=hall, **kw))
    return out

ev = [ev_(CHALK0, "chalk_write", -25, -0.1, {"dur": CHALK1 - CHALK0, "strokes": 7}),
      ev_(0.5, "blanket_rustle", -34, -0.3, {"dur": 0.25, "softness": 0.8, "intensity": 0.5}), ev_(4.85, "bonk", -33, 0.1, {"dur": 0.15})]   # the paper airplane
# #1 the whisper · #2 Maya · #3 Sam
ev += [line(SAY[1], 300, -23, 0.0, whisper=1.0, speed=0.85, room=-14),
       line(SAY[2], 345, -22, -0.15, shout=0.2, room=-15), line(SAY[3], 300, -20, 0.1, shout=0.4, speed=1.05, room=-14)]
ev += [ev_(SAY[2] + 0.05, "plush_squeak", -33, 0.1, {"pitch": 0.55, "dur": 0.2}),                         # the coffee: a soft bloop
       ev_(SAY[3] + 0.04, "bonk", -27, 0.1, {"dur": 0.25}), ev_(SAY[3] + 0.12, "fish_blub", -26, 0.1, {"n_bub": 3, "dur": 0.55})]
# #4 the front row · #5 the whole class (papers, the clock drops)
ev += chorus(SAY[4], 6, 280, 380, -27, room=-12, shout=0.5)
ev += chorus(SAY[5], 10, 270, 400, -27, room=-10, shout=0.75)
ev += [ev_(SAY[5] + 0.05, "blanket_rustle", -21, 0.0, {"dur": 1.6, "intensity": 1.2, "softness": 0.35, "strokes": 4}),
       ev_(16.97, "bonk", -23, 0.4, {"dur": 0.35}), ev_(16.99, "metal_clang", -31, 0.4, {"size": 0.3, "pitch": 1.6})]
# #6 · #7 recess (the swings go over the bar, the merry-go-round spins up, leaves)
ev += chorus(SAY[6], 12, 260, 400, -28, hall=-14, shout=0.7)
ev += chorus(SAY[7], 14, 250, 410, -27, hall=-11, shout=0.9)
ev += [ev_(SAY[7] + 0.1, "metal_groan", -30, 0.3, {"pitch": 1.5, "dur": 1.6}), ev_(SAY[7] + 0.3, "metal_groan", -32, -0.2, {"pitch": 0.8, "dur": 1.8}),
       ev_(SAY[7] + 0.1, "blanket_rustle", -28, 0.0, {"dur": 1.2, "intensity": 0.8, "softness": 0.6, "strokes": 3})]
# #8 the dad (deadpan) → every car alarm on the street: soft honk pulses + three cartoon "WEE-OO"s (the bubbles)
ev += [line(SAY[8], 118, -16, -0.1, contour=[[0, 1.0], [0.45, 0.98], [0.55, 0.9], [1, 0.8]], speed=0.8, rough=0.2, hall=-16)]
CARS = 8
for i in range(CARS):
    t0 = SAY[8] + 0.08 + i * 0.06
    for k in range(8): ev.append(ev_(t0 + k * 0.4 + (i % 2) * 0.2, "car_horn", -37 - (i % 3) * 2, ((i % 5) - 2) * 0.3, {"dur": 0.16, "pitch": 0.9 + 0.08 * (i % 4), "distance": 0.6 + 0.15 * (i % 4)}))
for k, t in enumerate([26.95, 27.35, 27.75]):
    ev.append(line(t, 560 + 60 * k, -24, (k - 1) * 0.4, text="w iy:3 uw:3", contour=[[0, 1.0], [0.45, 1.35], [1, 0.8]], hall=-14))
# #9–#11 the stadium chant; #11 the LED wall cracks, then shorts out
ev += chorus(SAY[9], 14, 110, 230, -29, hall=-10, shout=0.7)
ev += chorus(SAY[10], 16, 110, 240, -28, hall=-9, shout=0.85)
ev += chorus(SAY[11], 18, 105, 250, -27, hall=-8, shout=1.0)
ev += [ev_(SAY[11] + 0.08, "wood_snap", -18, 0.0, {"size": 1.6, "dur": 0.9}), ev_(SHORT, "metal_clang", -22, 0.0, {"size": 1.3, "pitch": 0.9}),
       ev_(SHORT + 0.05, "keyboard_type", -30, 0.0, {"dur": 0.8, "rate": 22.0}), ev_(SHORT + 0.1, "poof", -24, 0.0, {"size": 1.2, "dur": 1.0})]
# #12–#14 the sidewalk crowd; pigeons; the window cracks; the shatter wave (soft tinkles on the wave, no ping)
ev += chorus(SAY[12], 8, 120, 260, -27, hall=-12, shout=0.8)
ev += chorus(SAY[13], 10, 115, 270, -27, hall=-10, shout=0.9)
ev += chorus(SAY[14], 12, 110, 280, -26, hall=-9, shout=1.0)
for k in range(6): ev.append(ev_(SAY[12] + 0.05 + k * 0.06, "blanket_rustle", -31, (k - 2.5) * 0.15, {"dur": 0.22, "softness": 0.8, "intensity": 0.6}))
ev += [ev_(SAY[13] + 0.05, "wood_snap", -21, 0.2, {"size": 0.7, "dur": 0.6})]
PANE_X = [-28, -22, -16, -11.5, -7, -3, 1, 5, 9]
for k, x in enumerate(PANE_X):
    t = WAVE0 + max(0, x + 30) / WAVE_V
    ev += [ev_(t, "metal_clang", -30, max(-0.8, min(0.8, (x + 6) / 16)), {"size": 0.22, "pitch": 2.6 + 0.08 * (k % 4)}), ev_(t + 0.02, "car_crash", -31, 0.0, {"weight": 0.12})]
# the lab: the pen scribbles "67"; he reads it out loud → blown back, the seismograph lands
ev += [ev_(TRACE0, "pen_scribble", -27, 0.2, {"dur": TRACE1 - TRACE0}),
       line(SAY[15], 140, -17, 0.0, contour=[[0, 0.95], [0.45, 0.95], [0.55, 1.0], [1, 1.25]], speed=0.75, room=-12),
       ev_(SAY[15] + 0.05, "poof", -16, 0.0, {"size": 1.8, "dur": 1.2}), ev_(SAY[15] + 0.1, "blanket_rustle", -24, 0.0, {"dur": 1.2, "intensity": 1.0, "softness": 0.4, "strokes": 3}),
       ev_(SAY[15] + 0.65, "metal_clang", -24, -0.3, {"size": 0.8, "pitch": 1.1})]
# #16 the parrot; every bird faints (tiny eeps), then they plop onto the lawns
ev += [line(SAY[16], 640, -17, 0.1, shout=0.6, speed=1.25, rough=0.1, hall=-12), ev_(SAY[16] + 0.75, "parrot_chirp", -24, 0.1, {"pitch": 1.1})]
for k in range(16): ev.append(ev_(BIRD_OUT + 0.03 * k, "plush_squeak", -33 + (k % 3), ((k % 7) - 3) * 0.2, {"pitch": 1.4 + 0.04 * (k % 12), "dur": 0.1}))
for k in range(12): ev.append(ev_(48.9 + 0.15 * k + 0.04 * (k % 3), "bonk", -33 + (k % 2) * 2, ((k % 5) - 2) * 0.3, {"dur": 0.2}))
# #17 · #18 the whole planet (seen from orbit)
ev += chorus(SAY[17], 20, 95, 330, -28, hall=-7, shout=0.9, spread=0.14)
ev += [ev_(SAY[17] + 0.05, "distant_boom", -20, 0.0, {"size": 1.2, "dur": 3.0}), ev_(SAY[17] - 0.4, "low_swell", -28, 0.0, {"dur": 0.6, "pitch": 0.8})]
ev += chorus(SAY[18], 24, 90, 340, -28, hall=-6, shout=1.0, spread=0.16)
ev += [ev_(SAY[18] + 0.05, "distant_boom", -17, 0.0, {"size": 1.6, "dur": 3.5}), ev_(SAY[18] + 0.2, "low_swell", -24, 0.0, {"dur": 2.2, "pitch": 0.6})]
# +1 day: silence… Ms. Diaz: "Okay! Turn to page six—" (a gasp) → the class: "…SEVEN."
ev += [line(SIX, 215, -19, -0.1, text="ow k eh iy _ t er n t uw p eh jh s ih k s", contour=[[0, 1.1], [0.3, 1.0], [0.8, 1.05], [1, 1.12]], speed=1.1, room=-14),
       ev_(FREEZE + 0.02, "voice", -27, -0.1, {"text": "h aa:2", "pitch": 220, "whisper": 1.0})]
ev += chorus(SAY[19], 24, 270, 400, -25, hall=-7, shout=1.0, text="s eh:1.4 v ah n", contour=[[0, 1.05], [1, 0.8]], spread=0.06)
ev += [ev_(SAY[19] + 0.05, "blanket_rustle", -20, 0.0, {"dur": 1.6, "intensity": 1.2, "softness": 0.35, "strokes": 4}),
       ev_(SAY[19] + 0.97, "bonk", -23, 0.4, {"dur": 0.35})]
# the Moon blows up (rock chunks), then the Sun (the biggest one: a swell into it, a white-out, a long rumble)
ev += [ev_(MOON_HIT, "poof", -15, 0.0, {"size": 2.4, "dur": 1.4}), ev_(MOON_HIT + 0.02, "distant_boom", -17, 0.0, {"size": 1.4, "dur": 3.0}),
       ev_(MOON_HIT + 0.1, "car_crash", -24, 0.2, {"weight": 0.5})]
ev += [ev_(SUN_HIT - 0.35, "low_swell", -22, 0.0, {"dur": 0.6, "pitch": 1.1}), ev_(SUN_HIT, "poof", -13, 0.0, {"size": 3.0, "dur": 1.8}),
       ev_(SUN_HIT + 0.02, "distant_boom", -15, 0.0, {"size": 2.0, "dur": 3.5})]

cues = {
    "title": "dh008 - What if every 6-7 got twice as loud? (playground trap; the 6-7 voice grows from a whisper to the planet)",
    "duration": D, "target_lufs": -15.0, "limiter_ceiling_dbtp": -1.5, "end_fade": [D - 0.8, D],
    "stem_gain_db": {"music": -9.0, "sfx": 12.0, "amb": 9.0},
    "stem_dynamics": {"music": {"limit_dbfs": -3.0, "lim_win": 0.015}, "sfx": {"comp_thr_dbfs": -15.0, "ratio": 2.5, "win": 0.004, "limit_dbfs": -5.0}},
    "sfx_lowpass_hz": 5000,
    "shots": SCENES,
    "ambience": amb,
    "events": ev,
    "music": {"instrument": "bell", "echo": {"delay": 0.375, "feedback": 0.3, "mix": 0.24, "lp_hz": 3000},
              "gain_db": 0.0, "reverb_db": -9.0, "pad_db": 2.0, "pad_reverb_db": -5.0, "strings_db": 6.0,
              "mallet_db": -1.0, "drums_db": -8.0, "leveler": {"thr_rel_db": 3.0, "ratio": 2.5, "tau": 0.25}, "end": D,
              "chords": chords, "sections": sections, "melody": melody, "mallet_melody": mallet, "pad": pad,
              "drums": drums, "drum_patterns": drum_patterns, "stings": stings,
              "ducks": [], "auto_duck": {"db": -3.0, "categories": ["prop"], "lookahead": 0.04, "hold": 0.4, "smooth": 0.2, "max_len": 1.0},
              "eq": [{"f": 2800, "q": 0.8, "db": -2.0}, {"f": 6500, "q": 0.6, "db": -4.0}]},
}
json.dump(cues, open(sys.argv[1], "w"), indent=1)
print(f"events {len(ev)}, chords {len(chords)}, ambience {len(amb)}")
